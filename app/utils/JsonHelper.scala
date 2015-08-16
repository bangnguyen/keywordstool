package utils

import play.api.libs.functional.syntax._
import play.api.libs.json._
import play.api.libs.json.Json._
import play.api.libs.json.Reads._


import models._
import scala.collection.Seq
import play.api.libs.json.JsArray
import play.api.libs.json.JsSuccess
import play.api.libs.json.JsString
import play.api.libs.json.JsBoolean
import play.api.data.validation.ValidationError
import play.api.libs.json.JsNumber
import java.text.SimpleDateFormat

/**
 * Created by vbang.nguyen@gmail.com on 2/10/15.
 */

object JsonHelper {

  val simpleDateFormat = new SimpleDateFormat("dd-MM-yyyy")

  def anyToJson(value: Any): JsValue = {
    type mapStringAny = Map[String, Any]
    var result: JsValue = null
    if (value == null) {
      result = JsNull
    } else {
      if (value.isInstanceOf[BaseEntity]) {
        result = mapToJson(value.asInstanceOf[BaseEntity].getData())
      } else if (value.isInstanceOf[JsValue]) {
        result = value.asInstanceOf[JsValue]
      }
      else {
        val className = value.getClass.getSimpleName
        className match {
          case "String" => {
            val temps = value.asInstanceOf[String]
            try {
              result = Json.parse(temps)
            } catch {
              case e: Exception => result = JsString(temps)
            }
          }
          case "Integer" => {
            result = JsNumber(value.asInstanceOf[Integer].toLong)
          }
          case "Short" => {
            result = JsNumber(value.asInstanceOf[Short].toLong)
          }
          case "Boolean" => {
            result = JsBoolean(value.asInstanceOf[Boolean])
          }
          case "Long" => {
            result = JsNumber(value.asInstanceOf[Long])
          }
          /*    case "JsArray" => {
                result = value.asInstanceOf[JsArray]
              }*/
          case _ => {
            if (value.isInstanceOf[mapStringAny]) {
              result = mapToJson(value.asInstanceOf[Map[String, Any]])
            } else
            if (value.isInstanceOf[List[Any]]) {
              result = listToJson(value.asInstanceOf[List[Any]])

            } else {
              result = JsString(value.toString)
            }
          }
        }
      }
    }
    result
  }

  def mapToJson(data: Map[String, Any]): JsValue = {
    if (data != null) {
      toJson(data.foldLeft(Map[String, JsValue]())((r, e) => {
        r.+(e._1 -> anyToJson(e._2))
      }))
    }
    else JsString("")
  }


  def listToJson(list: List[Any]): JsValue = {
    JsArray(list.foldLeft(List[JsValue]())((r, e) => r.::(anyToJson((e)))))
  }

  def errorsToJson(errors: Seq[(JsPath, Seq[ValidationError])]): JsValue = {
    var globalMessage = ""
    var results = errors.foldLeft(Map[String, Any]())((r, u) => {
      val m = u._2.foldLeft(List[String]())((r1, u1) => {
        globalMessage += u1.message + "<br/>"
        r1.::(u1.message)
      })
      r.+(u._1.toString().replace("/", "") -> m)
    }
    )
    results += ("all" -> globalMessage)
    mapToJson(results)
  }


}
