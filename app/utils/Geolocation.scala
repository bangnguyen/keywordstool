package utils

import play.api.cache.Cache
import play.api.Play.current
import play.api.mvc.Request
import play.api.libs.json.{JsString, Json, JsValue}

/**
 * Created by vbang.nguyen@gmail.com on 2/10/15.
 */
object Geolocation {

  def getCountryCode(request: Any):String = {
    val ipAddress = request.asInstanceOf[Request[Any]].remoteAddress
    //val ipAddress = "54.225.230.43"
    val key = ipAddress + "_country"
    val result = Cache.getOrElse[String](key){
      val url = "http://api.hostip.info/get_json.php?ip=" + ipAddress
      val result: String = scala.io.Source.fromURL(url).mkString
      val ctCode = Json.parse(result).\("country_code").asInstanceOf[JsString].value
      println("get code from api "+ctCode)
      Cache.set(key, ctCode, 3600)
      ctCode
    }
    result
  }

}
