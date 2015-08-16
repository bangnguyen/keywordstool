/*global define */

'use strict';

define(function () {

    /* Controllers */

    var controllers = {};

    controllers.MyCtrl1 = function () {
    }
    controllers.MyCtrl1.$inject = [];

    controllers.MyCtrl2 = function () {
    }
    controllers.MyCtrl2.$inject = [];

    //    arabic, armenian, basque, brazilian, bulgarian, catalan, chinese,
    //    cjk, czech, danish, dutch, english, finnish, french, galician, german,
    //    greek, hindi, hungarian, indonesian, irish, italian, latvian, norwegian, persian,
    //    portuguese, romanian, russian, sorani, spanish, swedish, turkish, thai.
    controllers.Search = function ($scope, $http, $timeout,$location,$anchorScroll) {
        var map = new Object();
        map["english"] = "English";
        map["french"] = "French (Français)";
        map['german'] = "German (Deutsch)"
        map['vietnam'] = "Vietnamese (Việt)"
        map['spanish'] = "Spanish (Español)"
        map['russian'] = "Russian (Русский)"
        map['hindi'] = "Hindi (हिंदी)"
        map['greek'] = "Greek (ελληνικά)"
        map['turkish'] = "Turkish (Türk)"
        $(".tip-top").tooltip({placement: 'top'});


        $scope.keywordsSelectedObject = []
        $scope.allKeywordsObject = []
        $scope.currentMode = 'alphabet'
        $scope.calling = false
        $scope.lang = angular.element(document.body)[0].lang
        $scope.convertLang = function (lang) {
            return map[lang]
        }
        //$scope.languages = ["english", "french", "german", "spanish"]
        $scope.languages = ["english"]
        $scope.items = []
        $scope.total = 0
        $scope.responseTime = 0
        $scope.keyword = ""
        $scope.showMessage = false
        $scope.selectedKeywordsText = ""
        $scope.allKeywordsText = ""
        $scope.alphaBetKeywords = {}

        $scope.width_loading = "0%"
        $scope.alphabetKeys = []

        var timer = false;


        $scope.fallback = function (copy) {
            window.prompt('Press cmd+c to copy the text below.', copy);
        };

        $scope.lengthClipBoard = function () {
            return $scope.keywordsSelectedObject.length
        }
        $scope.part1 = function (text) {
            //
            if (text.indexOf($scope.keyword) == 0) {
                return ""
            }
            else {
                return text.substring(0, text.indexOf($scope.keyword));
            }
        }

        $scope.part2 = function () {
            return $scope.keyword
        }

        $scope.part3 = function (text) {
            //
            var string_replace = $scope.part1(text) + $scope.keyword
            return text.replace(string_replace, "")
        }


        $scope.getKeywordsForClipBoard = function (data) {
            var text = ""
            for (var i = 0; i < data.length; i++) {
                text += " \n" + data[i].text
            }
            return text
        }

        $scope.updateClipBoard = function (item) {
            var found = false
            for (var i = 0; i < $scope.keywordsSelectedObject.length; i++) {
                if ($scope.keywordsSelectedObject[i].text == item.text) {
                    found = true
                    $scope.keywordsSelectedObject.splice(i, 1);
                }
            }
            if (found == false) {
                $scope.keywordsSelectedObject.push(item)
            }
            // update ClipBoard
            $scope.selectedKeywordsText = $scope.getKeywordsForClipBoard($scope.keywordsSelectedObject)
        }


        $scope.getClass = function (item) {
            for (var i = 0; i < $scope.keywordsSelectedObject.length; i++) {
                if ($scope.keywordsSelectedObject[i].text == item.text)
                    return "info"
            }
            return ""
        }
        $scope.getClassButton = function (item) {
            for (var i = 0; i < $scope.keywordsSelectedObject.length; i++) {
                if ($scope.keywordsSelectedObject[i].text == item.text)
                    return "glyphicon glyphicon-remove"
            }
            return "glyphicon glyphicon-plus-sign"
        }

        $scope.increment_waiting_line = function () {
            var next = parseInt($scope.width_loading) + 5
            if (next == 100) {
                next = 0
            }
            $timeout(function () {
                $scope.width_loading = next + "%"
            }, 10);
            if ($scope.calling == true) {
                setTimeout($scope.increment_waiting_line, 500)
            }
            else {
                $timeout(function () {
                    $scope.width_loading = "0%"
                }, 10);
            }
        }

        $scope.copySelected = function () {
            //console.log("copySelected len " + $scope.keywordsSelectedObject.length)
        }

        $scope.getClassOrderBy = function (inputMode) {
            if ($scope.currentMode == inputMode) {
                return "btn-search btn-xs"
            }
            else {
                return "btn-default btn-xs"
            }
        }

        $scope.addToOrderDict_ = function (key, object) {
            if (key != undefined) {
                if (key in $scope.alphaBetKeywords) {
                        //$scope.alphaBetKeywords[firstLetter].unshift(object)
                        $scope.alphaBetKeywords[key].push(object)
                }
                else {
                    $scope.alphaBetKeywords[key] = [object]
                }
            }
        }


        $scope.addToOrderDict = function (word, phrase, object) {

            if (word == phrase) {
                $scope.alphaBetKeywords[""] = [object]
            }
            else {

                var prefix = phrase.substring(0, phrase.indexOf(word))
                if (prefix.length > 0) {
                    if (prefix.indexOf(' ') != prefix.length - 1) {
                        prefix = prefix.substring(0, prefix.lastIndexOf(" ")).trim()
                    }
                    else {
                        prefix = prefix.trim()
                    }

                    var key =  prefix.split(' ').pop()[0] +' '+word
                    $scope.addToOrderDict_(key, object)
                }

                var suffix = phrase.substring(phrase.indexOf(word) + word.length)
                if (suffix.length > 0) {
                    if (suffix.indexOf(" ") != 0) {
                        suffix = suffix.substring(suffix.split(' ')[0].length).trim()
                    }
                    else {
                        suffix = suffix.trim()
                    }
                    if (suffix.length > 0) {
                        var suffix_word = suffix.split(' ')[0]
                        var key =  word +' '+ suffix_word.split(' ').pop()[0]
                        $scope.addToOrderDict_(key, object)
                    }
                }
            }
        }


        $scope.orderBy = function (value) {
            $scope.currentMode = value
        }

        $scope.getItemListByKey = function (key) {
            //console.log(key)
            //console.log("getItemListByKey " +$scope.alphaBetKeywords[key])
            //console.log("getItemListByKey " +$scope.alphaBetKeywords[key].length)
            return  $scope.alphaBetKeywords[key]
        }

        $scope.goToZone = function(key){
            // set the location.hash to the id of
            // the element you wish to scroll to.



            $location.hash(key);

            // call $anchorScroll()
            $anchorScroll();
        }

        $scope.search = function () {
            console.log($scope.keyword_)
            $scope.keyword_ = "britney"
            var keyword = $scope.keyword_.trim()
            if (keyword.length > 1) {
                var urlSearch = jsRoutes.controllers.Application.search().url + "?keyword=" + keyword + "&lang=" + $scope.lang
                $scope.calling = true
                $scope.items = []
                $scope.total = 0
                $scope.showMessage = false
                var start = (new Date).getTime()
                setTimeout($scope.increment_waiting_line, 100)
                $http.get(urlSearch).
                    success(function (data, status, headers, config) {
                        $scope.alphaBetKeywords = {}
                        $scope.keyword = keyword
                        $scope.calling = false
                        $scope.items = data.data
                        $scope.total = data.total
                        var end = (new Date).getTime()
                        $scope.responseTime = (end - start) / 1000
                        $scope.showMessage = true
                        $scope.allKeywordsObject = data.data
                        $scope.allKeywordsText = $scope.getKeywordsForClipBoard(data.data)
                        $timeout(function () {
                            $scope.width_loading = "0%"
                        }, 10);

                        for (var i in $scope.allKeywordsObject) {
                            $scope.addToOrderDict($scope.keyword, $scope.allKeywordsObject[i].text, $scope.allKeywordsObject[i])
                        }
                        $scope.alphabetKeys = Object.keys($scope.alphaBetKeywords)

                        // this callback will be called asynchronously
                        // when the response is available
                    }).
                    error(function (data, status, headers, config) {
                        $scope.calling = false
                        $scope.responseTime = (end - start) / 1000
                        $scope.showMessage = true
                        $timeout(function () {
                            $scope.width_loading = "0%"
                        }, 10);
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                    });
            }
        }
    }
    controllers.Search.$inject = ["$scope", "$http", "$timeout","$location","$anchorScroll"];


    return controllers;

});