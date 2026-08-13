import logging
import sys


def setup_logging():
    log_format = "%(asctime)s | %(levelname)s | %(filename)s - %(funcName)s - %(lineno)d | %(message)s"
    formatter = logging.Formatter(fmt=log_format, datefmt="%Y-%m-%d %H:%M:%S")
    
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)

    file_handler = logging.FileHandler(
        "app.log",
        encoding="utf-8",
    )
    file_handler.setFormatter(formatter)

    logger = logging.getLogger()

    logger.setLevel(logging.INFO)

    logger.handlers.clear()

    logger.addHandler(console_handler)
    logger.addHandler(file_handler)
