FROM python:3.11

RUN mkdir /app
WORKDIR /app

# Install Poetry
RUN pip install --no-cache-dir poetry

# Copy the pyproject.toml and poetry.lock files to the working directory
COPY pyproject.toml poetry.lock ./

# Install dependencies using Poetry
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi

COPY ./app /app/app

# Set the PATH to include the Poetry-managed Python environment
ENV PYTHONPATH="/app/app:${PYTHONPATH}"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8888", "--reload"]