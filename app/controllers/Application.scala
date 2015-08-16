package controllers
import utils.Geolocation

import play.api.Routes
import play.api.mvc.{Action, Controller}
import core.search.Elastic
import play.api.libs.json.JsArray
import scala.util.matching.Regex


/**
 * Created by vbang.nguyen@gmail.com on 2/10/15.
 */
object Application extends Controller with ActionLoggable {
  val country_lang :Map[String,String] = Map("US" ->"english")
  val pattern = "iPhone|webOS|iPod|Android|BlackBerry|mobile|SAMSUNG|IEMobile|OperaMobi".r

  def index = Action {
    implicit request =>
      val userAgent = request.headers.get("User-Agent").getOrElse("")
      val isMobile = pattern findFirstIn userAgent
      val countryCode :String= Geolocation.getCountryCode(request)
      val lang  = country_lang.getOrElse(countryCode,"english")
      println("lang send to browser is " +lang)
      println(isMobile)
      if (isMobile.isEmpty) {
        Ok(views.html.Index(lang))
      }
      else {
        Redirect(routes.Application.mobile())
      }

  }

  def mobile = Action {
    implicit request =>
      val countryCode :String= Geolocation.getCountryCode(request)
      val lang  = country_lang.getOrElse(countryCode,"english")
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

  def search() = LoggableAction {
    implicit rs =>
      val keyword = rs.getQueryString("keyword").getOrElse("")
      val lang =    rs.getQueryString("lang").getOrElse("english")
      if (keyword.trim.length() > 1) {
        Ok(Elastic.search_keyword(keyword,lang))
      }
      else {
        NotFound
      }
  }





}
