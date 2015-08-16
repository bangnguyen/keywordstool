package utils
/**
 * Created by vbang.nguyen@gmail.com on 2/10/15.
 */

object Constant {

  
  val FOR_ES = 2
  val FOR_VIEW = 1

}


object FuncResult {
  val CALL_SUCCESS = 0
  val CALL_FAIL = -1
  val CALL_EXISTED_FAIL = -2
  val CALL_NOT_EXISTED_FAIL = -3
  val CALL_OTHER = -4

}


object Level extends Enumeration {
  type Level = Value
  val Beginner, Elem, PostElem, PreInter , Inter , PostInter , Advance= Value
}

