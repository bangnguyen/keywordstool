package controllers

import play.api.cache.Cache
import play.api.mvc._
import play.api.libs.json.{JsObject, Json, JsValue}
import play.api.libs.json.{JsNull, Json, JsString, JsValue}
import play.api.Play.current
import play.api.Logger




/**
 * Created by vbang.nguyen@gmail.com on 2/10/15.
 * A request that adds the User for the current call
 */
case class RequestIn(uri: String, method: String, remoteAddress: String, queryString: Any = None)


trait ActionLoggable extends Controller {
  val limit = 100
  val timeout = 86400

  /**
   * A secured action.  If there is no user in the session the request is redirected
   * to the login page
   *
   * @param p the body parser to use
   * @param f the wrapped action to invoke
   * @tparam A
   * @return
   */
  def LoggableAction[A](p: BodyParser[A])(f: Request[A] => Result) = Action(p) {
    implicit request => {
      val r = new RequestIn(uri = request.uri, method = request.method, remoteAddress = request.remoteAddress, queryString = request.queryString)
      val requestInfo = Json.obj(
        "uri" -> request.uri,
        "method" -> request.method,
        "body" -> request.body.asInstanceOf[JsValue],
        "remoteAddress" -> request.remoteAddress,
        "queryString" -> request.queryString
      )
      print(requestInfo.toString())
      f(request)
    }
  }


  def LoggableAction(f: Request[AnyContent] => Result): Action[AnyContent] = Action(parse.anyContent) {
    implicit request => {
      val remoteAddresse = request.remoteAddress
      val counter_key = remoteAddresse + "_counter"
      val isFirst = Cache.getOrElse[Boolean](remoteAddresse, limit)(true)
      var counterValue = 0
      println(isFirst)
      if (isFirst == true) {
        //set 1
        counterValue = 1
        Cache.set(remoteAddresse, false, limit)
        Cache.set(counter_key, counterValue)
      } else {
        counterValue = Cache.getAs[Int](counter_key).get + 1
        Cache.set(counter_key, counterValue)
      }
      if (counterValue > limit) {
        val requestInfo = Json.obj(
          "uri" -> request.uri,
          "method" -> request.method,
          "remoteAddress" -> request.remoteAddress,
          "queryString" -> request.queryString
        )
        Logger.warn("request counter " + counterValue + requestInfo.toString())
        Forbidden
      } else {
        f(request)
      }
    }
  }
}