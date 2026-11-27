"""Check the official destination in every rendered access-button position."""
import asyncio
from playwright.async_api import async_playwright


async def main():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        for width, height in [(1440, 900), (851, 622), (390, 844)]:
            page = await browser.new_page(viewport={"width": width, "height": height})
            await page.goto("http://localhost:8080", wait_until="load")
            for label, dest in [(r"Médico / Clínica", "/login"), (r"Portal do Paciente", "/area")]:
                links = page.get_by_role("link", name=label)
                assert await links.count() == 2, f"Missing access position: {label}, {width}"
                for link in await links.all():
                    assert await link.is_visible(), f"Hidden access: {label}, {width}"
                    assert await link.get_attribute("href") == dest, (
                        f"Wrong destination: {label}, {width}"
                    )
            await page.close()
        await browser.close()
        print("Both access destinations verified in header and hero at all three widths.")


asyncio.run(main())