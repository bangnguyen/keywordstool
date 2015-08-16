package utils

import play.api.Logger
import play.api.mvc.RequestHeader


/**
 * Created by vbang.nguyen@gmail.com on 2/10/15.
 */

object Log {
  def formatLogString(msg: String)(implicit request: RequestHeader = null) = {
    msg
  }

  def trace(message: => String)(implicit request: RequestHeader = null) {
    Logger.trace(formatLogString(message))
  }

  /**
   * Logs a message with the `TRACE` level.
   *
   * @param message the message to log
   * @param error the associated exception
   */
  def trace(message: => String, error: => Throwable)(implicit request: RequestHeader) {
    Logger.trace((formatLogString(message)), error)
  }

  /**
   * Logs a message with the `DEBUG` level.
   *
   * @param message the message to log
   */
  def debug(message: => String)(implicit request: RequestHeader = null) {
    Logger.debug(formatLogString(message))
  }

  /**
   * Logs a message with the `DEBUG` level.
   *
   * @param message the message to log
   * @param error the associated exception
   */
  def debug(message: => String, error: => Throwable)(implicit request: RequestHeader) {
    Logger.debug((formatLogString(message)), error)
  }

  /**
   * Logs a message with the `INFO` level.
   *
   * @param message the message to log
   */
  def info(message: => String)(implicit request: RequestHeader = null) {
    Logger.info(formatLogString(message))
  }

  /**
   * Logs a message with the `INFO` level.
   *
   * @param message the message to log
   * @param error the associated exception
   */
  def info(message: => String, error: => Throwable)(implicit request: RequestHeader) {
    Logger.info((formatLogString(message)), error)
  }

  /**
   * Logs a message with the `WARN` level.
   *
   * @param message the message to log
   */
  def warn(message: => String)(implicit request: RequestHeader = null) {
    Logger.warn(formatLogString(message))
  }

  /**
   * Logs a message with the `WARN` level.
   *
   * @param message the message to log
   * @param error the associated exception
   */
  def warn(message: => String, error: => Throwable)(implicit request: RequestHeader) {
    Logger.warn((formatLogString(message)), error)
  }

  /**
   * Logs a message with the `ERROR` level.
   *
   * @param message the message to log
   */
  def error(message: => String)(implicit request: RequestHeader = null) {
    Logger.error(formatLogString(message))
  }

  /**
   * Logs a message with the `ERROR` level.
   *
   * @param message the message to log
   * @param error the associated exception
   */
  def error(message: => String, error: => Throwable)(implicit request: RequestHeader) {
    Logger.error((formatLogString(message)), error)
  }
}
