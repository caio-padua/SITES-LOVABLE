"""Run with python3 tests/paxmed-live-logo.spec.py using sandbox Playwright."""
import asyncio
import os
import unittest
from playwright.async_api import async_playwright


class OfficialLogoTiming(unittest.TestCase):
    def test_letters_follow_symbol_by_900ms_without_cycle_drift(self):
        asyncio.run(self.verify_timing())

    async def verify_timing(self):
        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch(headless=True)
            try:
                page = await browser.new_page()
                await page.goto(os.environ.get("PARXIS_URL", "http://localhost:8080"))
                logo = page.locator(".paxmed-live-logo")
                await logo.wait_for()
                timings = await logo.evaluate("""el => el.getAnimations({subtree:true}).map(a => ({
                    name:a.animationName, delay:a.effect.getTiming().delay,
                    duration:a.effect.getTiming().duration
                }))""")
                symbol = next(a for a in timings if a["name"] == "tfFlash")
                spark = next(a for a in timings if a["name"].startswith("prg-spark-"))
                sweep = next(a for a in timings if a["name"] == "tfSweep")
                word_sweep = next(a for a in timings if a["name"].startswith("prg-sweep-"))
                self.assertEqual(spark["delay"] - symbol["delay"], 900)
                self.assertEqual(word_sweep["delay"] - sweep["delay"], 900)
                self.assertEqual(symbol["duration"], 12000)
                self.assertEqual(spark["duration"], symbol["duration"])
                self.assertEqual(word_sweep["duration"], sweep["duration"])
            finally:
                await browser.close()


if __name__ == "__main__":
    unittest.main()