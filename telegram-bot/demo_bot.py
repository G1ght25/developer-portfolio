"""
Entrypoint for Demo Portfolio Bot
Can be executed directly: python demo_bot.py
"""

import sys
import asyncio
from bot import main, logger

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logger.info("Bot stopped by user.")
