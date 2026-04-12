import httpx
import asyncio

async def test_patch():
    url = "http://localhost:8080/api/v1/households/any-id"
    print(f"Testing PATCH {url}...")
    try:
        async with httpx.AsyncClient() as client:
            # We don't even need a real ID to check if it responds (it should 404 or 401)
            response = await client.patch(url, json={"preferences": {}}, timeout=5.0)
            print(f"Status: {response.status_code}")
            print(f"Body: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_patch())
