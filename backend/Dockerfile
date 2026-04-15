FROM python:3.11

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ .

RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD gunicorn config.wsgi --bind 0.0.0.0:$PORT