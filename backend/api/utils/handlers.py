from rest_framework.views import exception_handler
from api.utils.logger_utils import logger


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        logger.error(
            f"Ошибка: {str(exc)} в {context['view'].__class__.__name__} - "
            f"Статус: {response.status_code}"
        )

    return response
