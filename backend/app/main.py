from fastapi import FastAPI

app = FastAPI()


@app.get("/api/")
async def root():
    return {"message": "Yescus is very very very very smart"}