
name := "keywordstool"

version := "2.0-SNAPSHOT"

scalaVersion := "2.11.5"

libraryDependencies ++= Seq(
   cache,
  "org.webjars" % "angularjs" % "1.3.0-beta.2",
  "org.webjars" % "requirejs" % "2.1.11-1",
  "com.sksamuel.elastic4s" % "elastic4s_2.11" % "1.4.11"
)
    
lazy val root = (project in file(".")).enablePlugins(PlayScala)

pipelineStages := Seq(rjs, digest, gzip)

