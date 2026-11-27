"""Safe audit: public navigation and intercepted writes, never production records."""
import asyncio
import re
from pathlib import Path
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context = await browser.new_context()
        writes = []
        async def intercept(route):
            request = route.request
            if request.method in ("GET", "HEAD", "OPTIONS"):
                await route.continue_()
                return
            if "/rest/v1/leads" in request.url:
                writes.append(("cloud", request.post_data_json))
                await route.fulfill(status=201, content_type="application/json", body="[]")
            elif "/api/vitrine-contatos" in request.url:
                writes.append(("api", request.post_data_json))
                await route.fulfill(status=503, content_type="application/json", body='{"error":"synthetic audit failure"}')
            else:
                await route.abort()
        await context.route("**/*", intercept)
        page = await context.new_page()
        screenshots = Path("/tmp/browser/paxmed-verify")
        screenshots.mkdir(parents=True, exist_ok=True)
        await page.goto("http://localhost:8080", wait_until="networkidle")
        for name, value in {"nome":"Auditoria sintética", "email":"audit@example.invalid", "clinica":"Clínica sintética", "necessidade":"Verificação sem dados pessoais"}.items():
            await page.locator(f'[name="{name}"]').fill(value)
        await page.locator('[name="especialidade"]').select_option(index=1)
        await page.locator('#contato button[type="submit"]').press("Enter")
        await page.get_by_text("É necessário aceitar os termos", exact=False).wait_for()
        assert not writes, "Contact without consent must not send"
        await page.locator('#contato input[type="checkbox"]').check()
        await page.locator('#contato button[type="submit"]').press("Enter")
        await page.get_by_text("Sua candidatura foi recebida.", exact=True).wait_for()
        assert {service for service, _ in writes} == {"cloud", "api"}
        cloud = next(data for service, data in writes if service == "cloud")
        api = next(data for service, data in writes if service == "api")
        assert cloud["email"] == "audit@example.invalid"
        assert cloud["telefone"] is None and cloud["volume_protocolos"] is None
        assert api["source"] == "paxmed-homepage"
        assert {k:v for k,v in api.items() if k != "source"} == cloud
        print("Contact: consent blocks sending; both intercepted payloads match. Existing confirmation ignores API 503.")
        await page.goto("http://localhost:8080/convite", wait_until="networkidle")
        await page.locator('[name="nome"]').fill("x")
        await page.get_by_role("button", name="Enviar solicitação").press("Enter")
        await page.get_by_text("Informe seu nome completo.", exact=True).wait_for()
        assert len(writes) == 2
        print("Invite: invalid name rejected locally; no request or record created.")
        await page.goto("http://localhost:8080/login/diag", wait_until="networkidle")
        await page.get_by_role("heading", name="DIAGNÓSTICO · LOGIN").wait_for()
        await page.get_by_role("link", name="voltar ao login").click()
        assert page.url.endswith("/login")
        print("Diagnostics: correct page renders and returns to preserved legacy login.")
        await page.goto("http://localhost:8080", wait_until="networkidle")
        await page.get_by_role("link", name="Área do Médico / Clínica").first.click()
        await page.get_by_role("button", name=re.compile(r"^entrar$", re.I)).wait_for(timeout=45000)
        assert page.url == "https://paxmed.com.br/login"
        await page.screenshot(path=str(screenshots / "clicked-manager-login.png"))
        print("Doctor link: navigation reaches Manager credential screen; no login submitted.")
        await page.goto("http://localhost:8080", wait_until="networkidle")
        await page.get_by_role("link", name="Portal do Paciente").first.click()
        await page.get_by_placeholder("000.000.000-00").wait_for(timeout=45000)
        assert page.url == "https://paxmed.com.br/area"
        await page.screenshot(path=str(screenshots / "clicked-manager-area.png"))
        print("Patient link: navigation reaches Manager CPF/date-of-birth screen; no login submitted.")
        await browser.close()

asyncio.run(main())
