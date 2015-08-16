package controllers

import java.io.{File, FileWriter}
import java.text.SimpleDateFormat
import java.util.Calendar

import play.api.cache.Cache
import utils.Geolocation
import play.api.Play.current
import play.api.Routes
import play.api.mvc.{Action, Controller}
import core.search.Elastic
import play.api.libs.json.JsObject

/**
 * Created by vbang.nguyen@gmail.com on 2/10/15.
 * A request that adds the User for the current call
 */
object Application extends Controller with ActionLoggable {
  val country_lang: Map[String, String] = Map("US" -> "english")
  val pattern = "iPhone|webOS|iPod|Android|BlackBerry|mobile|SAMSUNG|IEMobile|OperaMobi".r
  val format = new SimpleDateFormat("dd/MM/yyyy hh:mm:ss")

  val homeFolder = System.getProperty("user.home")

  val home = new File(homeFolder);
  val traceFileName = new File(home, "ElasticLog.txt");

  def index = Action {
    implicit request =>


      val userAgent = request.headers.get("User-Agent").getOrElse("")
      val isMobile = pattern findFirstIn userAgent
      val countryCode: String = Geolocation.getCountryCode(request)
      val lang = country_lang.getOrElse(countryCode, "english")
      val remoteAddresse = request.remoteAddress
      Cache.set(remoteAddresse + "_country", countryCode, 3600)
      if (isMobile.isEmpty) {
        Ok(views.html.Index(lang))
      }
      else {
        Redirect(routes.Application.mobile())
      }

  }

  def mobile = Action {
    implicit request =>
      val countryCode: String = Geolocation.getCountryCode(request)
      val lang = country_lang.getOrElse(countryCode, "english")
      Ok(views.html.mobileView(lang))
  }


  def jsRoutes(varName: String = "jsRoutes") = Action {
    implicit request =>
      Ok(
        Routes.javascriptRouter(varName)(
          controllers.routes.javascript.Application.search
        )
      ).as(JAVASCRIPT)
  }

  def writeToLog(text: String) = {
    val fw = new FileWriter(traceFileName, true)
    try {
      println(text)
      println("write to " + traceFileName)
      fw.write(text + " \n")
    }
    finally fw.close()

  }

  def search() = LoggableAction {
    implicit rs =>
      val keyword = rs.getQueryString("keyword").getOrElse("")
      val lang = rs.getQueryString("lang").getOrElse("english")
      val remoteAddresse = rs.remoteAddress
      val country = Cache.getOrElse[String](remoteAddresse + "_country")("XX")
      val datestring = format.format(Calendar.getInstance().getTime())
      val timestamp = System.currentTimeMillis / 1000
      val logstring = remoteAddresse + " ; " + country + " ; " + keyword + " ; " + lang + " ; " + datestring + " ; " + timestamp
      //writeToLog(logstring)
      Elastic.store("es", "query", Map("ip" -> remoteAddresse,
        "country" -> country,
        "keyword" -> keyword,
        "lang" -> lang,
        "date" -> datestring,
        "timestamp" -> timestamp))
      if (keyword.trim.length() > 1) {
        Ok(Elastic.search_keyword(keyword, lang))
      }
      else {
        NotFound
      }
  }


}
