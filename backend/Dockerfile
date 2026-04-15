FROM python:3.11

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ .

RUN python manage.py collectstatic --noinput

COPY backend/start.sh .
RUN chmod +x start.sh

EXPOSE 8000

CMD ["./start.sh"]