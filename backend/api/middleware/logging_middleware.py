import time
from api.utils.logger_utils import logger


class LoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()

        response = self.get_response(request)

        duration = time.time() - start_time
        logger.info(
            f"Запрос: {request.method} {request.path} - "
            f"Статус: {response.status_code} - "
            f"Длительность: {duration:.2f}s - "
            f"Пользователь: {request.user}"
        )

        return response