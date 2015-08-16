package core.search

import org.elasticsearch.action.search.SearchResponse
import scala.collection.JavaConversions._
import com.sksamuel.elastic4s._
import com.sksamuel.elastic4s.ElasticDsl._
import play.api.libs.json._
import utils.JsonHelper
import org.elasticsearch.search.sort.SortOrder
import play.api.Play.current



/**
 * Created by vbang.nguyen@gmail.com on 2/10/15.
 */
object Elastic {

  val defaultIndex = "english"
  val hostname =   current.configuration.getString("elastic.host").getOrElse("localhost")
  val elasticClient: ElasticClient = ElasticClient.remote(hostname, 9300)
  val defaultDocument = "keyword"
  val defaultLimit = 1000

  def url(indexName: String, indexType: String) = indexName + "/" + indexType


  def deleteIndex(name: String) = {
    elasticClient.execute {
      ElasticDsl.deleteIndex(defaultIndex)
    }
  }

  def search_keyword(keyword: String, indexName: String): JsValue = {
    var keyword_clean = keyword.replaceAll(" +"," ")
    try {
      var resp = elasticClient.execute {
        search in indexName types defaultDocument fields("text", "popularity") query {
          wildcardQuery("text_", "*"+keyword_clean+"*")
        } from 0 limit defaultLimit sort {
          by field "popularity" order SortOrder.DESC
        }
      }.await
      if (resp.getHits().getTotalHits() < 500 && keyword_clean.split(" ").length > 1) {
        keyword_clean =  keyword_clean.replace(" ","*")
        resp = elasticClient.execute {
          search in indexName types defaultDocument fields("text", "popularity") query {
            wildcardQuery("text_", "*"+keyword_clean+"*")
          } from 0 limit defaultLimit sort {
            by field "popularity" order SortOrder.DESC
          }
        }.await
        println( "*"+keyword_clean+"*")
      }
      convert_to_json(resp)
    } catch {
      case e: Exception => {
        println(e.getCause())
        println("Error ")
        JsNull
      }
    }
  }


  def search_generic(keyword: String, page: Int, pageSize: Int, entityTypes: String*) = {
    val query = ElasticDsl.search in defaultIndex types (entityTypes: _*)
    query.from((page - 1) * pageSize).limit(pageSize)
    val response = elasticClient.execute(query)
    response
  }


  def convert_to_json(r: SearchResponse): JsValue = {
    val hits = r.getHits
    val iterator = hits.iterator()
    var result: List[Map[String, Any]] = List()
    while (iterator.hasNext) {
      val searchHit = iterator.next()
      var source = searchHit.getSource
      if (source != null) {
        source = source + ("type" -> searchHit.getType)
        source = source + ("id" -> searchHit.getId)
        result ::= source.toMap
      } else {
        result ::= searchHit.getFields.values().foldLeft(Map[String, Any]())((r, e) =>
          r + (e.name() -> e.value()))
      }

    }
    val final_result = Map("total" -> hits.totalHits(), "data" -> result)
    JsonHelper.anyToJson(final_result)
  }
}

