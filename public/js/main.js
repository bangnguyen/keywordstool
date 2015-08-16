/*global require, requirejs */

'use strict';


function getDevice() {
    var ua = navigator.userAgent;
    console.log(ua);
    var checker = {
        iphone: ua.match(/(iPhone)/),
        blackberry: ua.match(/BlackBerry/),
        android: ua.match(/Android/)
    };
    if (checker.android || checker.iphone || checker.blackberry) {
        return "mobile"
    }
    else {
        return "pc"
    }
}
requirejs.config({
    paths: {
        'angular': ['../lib/angularjs/angular'],
        'angular-route': ['../lib/angularjs/angular-route']
    },
    shim: {
        'angular': {
            exports: 'angular'
        },
        'angular-route': {
            deps: ['angular'],
            exports: 'angular'
        }
    }
});

require(['angular', './controllers', './directives', './filters', './services', 'angular-route', './ng-clip'],
    function (angular, controllers) {
        // Declare app level module which depends on filters, and services
        var myapp = angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'ngRoute', 'ngClipboard', 'ngClipboard'])

        /*
         myapp.config(['$routeProvider', function ($routeProvider) {
         $routeProvider.when('/search', {templateUrl: 'assets/search.html', controller: controllers.Search});
         $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: controllers.MyCtrl1});
         $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: controllers.MyCtrl2});
         $routeProvider.otherwise({redirectTo: '/search'});
         }]);
         */

        myapp.config(['ngClipProvider', function (ngClipProvider) {
            ngClipProvider.setPath("//cdnjs.cloudflare.com/ajax/libs/zeroclipboard/2.1.6/ZeroClipboard.swf");
        }]);

        myapp.controller('Search', ['$scope', '$http', '$timeout', '$location', '$anchorScroll','$sce',
            function ($scope, $http, $timeout, $location, $anchorScroll,$sce) {
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
                $("#control_position").show()
                //$("#alphabet_container").show()
                //$("#popularity_container").show()


                $scope.keywordsSelectedObject = []
                $scope.allKeywordsObject = []
                $scope.currentMode = 'alphabet'
                $scope.calling = false
                $scope.lang = angular.element(document.body)[0].lang
                $scope.convertLang = function (lang) {
                    return map[lang]
                }
                //$scope.languages = ["english", "french", "german", "spanish"]
                $scope.languages = ["english", "french", "german"]
                $scope.total = 0
                $scope.responseTime = 0
                $scope.keyword = ""
                $scope.selectedKeywordsText = ""
                $scope.allKeywordsText = ""
                $scope.alphaBetKeywords = {}

                $scope.width_loading = "0%"
                $scope.alphabetKeys = []
                $scope.TrSelected = ""
                $scope.start = false


                $scope.fallback = function (copy) {
                    window.prompt('Press cmd+c to copy the text below.', copy);
                };

                $scope.lengthClipBoard = function () {
                    // console.log("lengthClipBoard");
                    return $scope.keywordsSelectedObject.length
                }


                $scope.part_not_bold = function (word, phrase) {
                    // console.log("part_not_bold");
                    // keyword : oa
                    //phrase : cong hoa xa hoi
                    var suffix = phrase.substring(phrase.indexOf(word) + word.length);
                    if (suffix.length > 0) {
                        if (suffix[0] == " ") {
                            return phrase.substring(0, phrase.indexOf(word) + word.length);
                        }
                        else {
                            return word + suffix.split(' ')[0]
                        }
                    }
                    else {
                        return phrase
                    }
                }

                $scope.part_bold = function (word, phrase) {
                    //   console.log("part_bold");
                    var part_not_bold = $scope.part_not_bold(word, phrase)
                    return phrase.substring(phrase.indexOf(part_not_bold) + part_not_bold.length)
                }


                $scope.getKeywordsForClipBoard = function (data) {
                    //console.log("getKeywordsForClipBoard");
                    var text = ""
                    for (var i = 0; i < data.length; i++) {
                        text += " \n" + data[i].text
                    }
                    return text
                }

                $scope.updateClipBoard = function (item) {
                    // console.log("updateClipBoard");
                    var found = false
                    for (var i = 0; i < $scope.keywordsSelectedObject.length; i++) {
                        if ($scope.keywordsSelectedObject[i].text == item.text) {
                            found = true
                            // remove
                            item.is_add = false
                            $scope.keywordsSelectedObject.splice(i, 1);
                        }
                    }
                    if (found == false) {
                        //add
                        item.is_add = true
                        $scope.keywordsSelectedObject.push(item)
                    }
                    // update ClipBoard
                    $scope.selectedKeywordsText = $scope.getKeywordsForClipBoard($scope.keywordsSelectedObject)

                }


                $scope.getClass = function (item) {
                    //  console.log("getClass");
                    for (var i = 0; i < $scope.keywordsSelectedObject.length; i++) {
                        if ($scope.keywordsSelectedObject[i].text == item.text)
                            return "info"
                    }
                    return ""
                }
                $scope.getClassButton = function (item) {
                    for (var i = 0; i < $scope.keywordsSelectedObject.length; i++) {
                        if ($scope.keywordsSelectedObject[i].text == item.text)
                            return "remove"
                    }
                    return "add"
                }

                $scope.increment_waiting_line = function () {
                    if ($scope.calling == true) {
                        var next = parseInt($scope.width_loading) + 5
                        if (next == 100) {
                            next = 0
                        }

                        $timeout(function () {
                            $scope.width_loading = next + "%"
                        }, 20);
                        setTimeout($scope.increment_waiting_line, 100)
                    }
                    else {
                        /* $scope.width_loading = "0%"*/
                        $timeout(function () {
                            $scope.width_loading = "0%"
                        }, 20);
                    }
                }

                $scope.copySelected = function () {
                    // console.log("copySelected");
                    //console.log("copySelected len " + $scope.keywordsSelectedObject.length)
                }

                $scope.getClassOrderBy = function (inputMode) {
                    //   console.log("getClassOrderBy");
                    if ($scope.currentMode == inputMode) {
                        return "btn_order_color"
                    }
                    else {
                        return "btn_order_default"
                    }
                }

                $scope.addToOrderDict_ = function (key, object) {
                    //  console.log("addToOrderDict_");
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
                    //  console.log("addToOrderDict");

                    word = word.split(/ +/).join(" ").trim()
                    phrase = phrase.split(/ +/).join(" ").trim()

                    var key = word

                    if (word != phrase) {
                        var suffix = phrase.substring(phrase.indexOf(word) + word.length);
                        if (suffix.indexOf(" ") == 0) {
                            key = word + ' ' + suffix[1]
                        }
                        else {
                            var data = suffix.split(' ')
                            if (data.length > 1) {
                                key = word + ' ' + data[1][0]
                            }

                        }
                    }
                    $scope.addToOrderDict_(key, object)

                }


                $scope.orderBy = function (value) {
                    // console.log("orderBy");
                    $scope.currentMode = value
                }

                $scope.getItemListByKey = function (key) {
                    return $scope.alphaBetKeywords[key]
                }


                $scope.getKeywordSelected = function (key) {
                    // console.log("getKeywordSelected");
                    if ($scope.TrSelected == key) {
                        return "keywords_selected"
                    } else {
                        return "keywords_no_selected"
                    }
                }

                $scope.getKeywordSelectedForControl = function (key) {
                    //console.log("getKeywordSelectedForControl");
                    if ($scope.TrSelected == key) {
                        return "control_tr_selected"
                    } else {
                        return "control_tr_no_selected"
                    }
                }


                $scope.orderByKeys = function (keyword, allKeywords) {
                    //console.log("orderByKeys");
                    // allKeywords ["", "obama a", "obama b", "obama c", "obama d", "obama e", "obama f", "obama g", "obama h", "obama i", "obama j", "obama k", "obama l", "obama m", "obama n", "obama o", "obama p", "obama q", "obama r", "obama s", "obama t", "obama u", "obama v", "obama w", "obama y", "obama z", "obama 0", "obama 2", "obama 5", "obama 6"]
                    //allKeywords ["go to", "go to &", "go to 1", "go to 2", "go to 3", "go to 5", "go to a", "go to b", "go to c", "go to d", "go to e", "go to f", "go to g", "go to h", "go to i", "go to k", "go to l", "go to m", "go to n", "go to o", "go to p", "go to q", "go to r", "go to s", "go to t", "go to u", "go to v", "go to w", "go to y"]

                    var allKwClean = {}
                    for (var i in allKeywords) {
                        if (allKeywords[i] == keyword) {
                            allKwClean[""] = keyword
                        }
                        else {
                            var data_list = allKeywords[i].split(" ")
                            allKwClean[data_list[data_list.length - 1]] = allKeywords[i]
                        }
                    }
                    return allKwClean
                }

                $scope.orderAlphabetKeys = function (data) {
                    //  console.log("orderAlphabetKeys");
                    //alphabetKeys

                    var allKeywords = Object.keys(data)
                    var allKwClean = []
                    var kwDouble = []
                    for (var i in allKeywords) {
                        var key = allKeywords[i].replace($scope.keyword, '').trim()


                        if (allKwClean.indexOf(key) > -1) {
                            kwDouble.push(key)
                        } else {
                            allKwClean.push(key)
                        }
                    }
                    allKwClean = allKwClean.sort()

                    for (var i in kwDouble) {
                        var key = kwDouble[i]
                        var index = allKwClean.indexOf(key)
                        allKwClean[index] = key + "_"
                        allKwClean.splice(index, 0, "_" + key);
                    }

                    var result = {}
                    for (var i in allKwClean) {
                        if (allKwClean[i].indexOf('_') == 0) {
                            result[allKwClean[i]] = allKwClean[i].replace('_', $scope.keyword + ' ')
                        }
                        else if (allKwClean[i].indexOf('_') == 1) {
                            result[allKwClean[i]] = allKwClean[i].replace('_', ' ' + $scope.keyword)
                        }
                        else {
                            var newkeyword = $scope.keyword + ' ' + allKwClean[i]
                            if (allKeywords.indexOf(newkeyword) > -1) {
                                result[allKwClean[i]] = newkeyword
                            }
                            else {
                                result[allKwClean[i]] = allKwClean[i] + ' ' + $scope.keyword
                            }
                        }
                    }
                    return result
                }

                $scope.goToZone = function (key) {
                    $scope.TrSelected = $scope.orderKeys[key]

                    $('html, body').animate({
                        scrollTop: $("[id='" + $scope.orderKeys[key] + "']").offset().top - 200
                    }, 50);

                    /*   // console.log("goToZone");
                     // set the location.hash to the id of
                     // the element you wish to scroll to.

                     //return  $scope.alphaBetKeywords[key]
                     $scope.TrSelected = $scope.orderKeys[key]
                     $location.hash($scope.orderKeys[key]);

                     // call $anchorScroll()
                     $anchorScroll();
                     window.setTimeout(function () {
                     window.scroll(0, document.body.scrollTop - 100)
                     }, 50);*/


                }


                $scope.getHeightTableAlphabet = function (index) {
                    //  console.log("getHeightTableAlphabet");
                    if ((index + 1) % 3 == 0) {
                        var allKeys = $scope.alphabetKeys.sort()
                        var len1 = $scope.alphaBetKeywords[allKeys[index - 2]].length
                        var len2 = $scope.alphaBetKeywords[allKeys[index - 1]].length
                        var len3 = $scope.alphaBetKeywords[allKeys[index]].length
                        var max = Math.max(len2, len3);
                        return ""
                        //return max*50+"px"
                    }
                    else {
                        return ""
                    }
                }


                $scope.getKeyOrdersFromDic = function (data) {
                    // data {0: "obama 0", 2: "obama 2", 5: "obama 5"}
                    var keys = Object.keys(data)
                    var finalResult = []
                    var first = []
                    var partChars = []
                    var partNumbers = []
                    for (var i = 0; i < keys.length; i++) {
                        if (keys[i] == "") {
                            first = [""]
                        }
                        // in key is a not number, so it is character
                        else if (isNaN(keys[i]) == true) {
                            partChars.push(keys[i])
                        }
                        else {
                            partNumbers.push(keys[i])
                        }
                    }

                    finalResult = finalResult.concat(first)
                    finalResult = finalResult.concat(partChars.sort())
                    finalResult = finalResult.concat(partNumbers.sort())
                    return finalResult
                }

                $scope.orderKeysByAlphabet = function (alphaBetKeywords) {
                    //  console.log("orderKeysByAlphabet");
                    // alphaBetKeywords : Ex : {'obama work ': object}
                    // Object {ob g: Array[27], ob c: Array[61], "": Array[29], ob h: Array[36], ob l: Array[41]…}
                    var input = angular.copy(alphaBetKeywords)
                    var results = Object.keys(input)
                    var finalResult = []
                    var firstPart = []
                    var partChars = []
                    var partNumbers = []
                    for (var i = 0; i < results.length; i++) {
                        if (results[i] == "") {
                            firstPart = [""]
                        }
                        // in key is a not number, so it is character
                        else if (isNaN(results[i].split(" ")[1]) == true) {
                            partChars.push(results[i])
                        }
                        else {
                            partNumbers.push(results[i])
                        }
                    }
                    finalResult = finalResult.concat(firstPart)
                    finalResult = finalResult.concat(partChars.sort())
                    finalResult = finalResult.concat(partNumbers.sort())
                    return finalResult
                }

                $scope.toLocaleString = function (data) {
                    //  console.log("toLocaleString");
                    return parseFloat(data).toLocaleString('en-US')
                }

                $scope.getDevice = function () {
                    //console.log("getDevice");
                    return getDevice()
                }

                $scope.normanize_data = function (data) {
                    for (var i = 0; i < data.length; i++) {
                        data[i]['popularity'] = $scope.toLocaleString(data[i]['popularity'])
                        data[i]['part_not_bold'] = $scope.part_not_bold($scope.keyword, data[i].text)
                        data[i]['part_bold'] = $scope.part_bold($scope.keyword, data[i].text)
                        data[i]['is_add'] = false
                    }
                    return data
                }
                $scope.html_alphabet_container = function (orderKeywords) {


                    for (var i in orderKeywords) {

                    }

                }

                $scope.search = function () {
                    var keyword = ""
                    keyword = $("#keyword").val()
                  /*  if (getDevice() == "pc") {
                        keyword = $("#keyword_pc").val()
                    }
                    else {
                        keyword = $("#keyword_mobile").val()
                    }*/
                    if (keyword.length > 1 && $scope.calling == false) {
                        var urlSearch = jsRoutes.controllers.Application.search().url + "?keyword=" + keyword + "&lang=" + $scope.lang
                        $scope.calling = true
                        setTimeout($scope.increment_waiting_line, 100)
                        $scope.total = 0
                        $scope.showMessage = false
                        var start = (new Date).getTime()
                        $scope.alphabet_container_process = false
                        $scope.popularity_container_process = false

                        $http.get(urlSearch).
                            success(function (data, status, headers, config) {
                                $scope.start = true
                                if (data != null) {
                                    $scope.alphaBetKeywords = {}
                                    $scope.keyword = keyword
                                    $scope.total = data.total
                                    var end = (new Date).getTime()
                                    $scope.responseTime = (end - start) / 1000

                                    $scope.message = $sce.trustAsHtml("Search for keyword <b>"+keyword+ "</b> found <b>"+$scope.total+"</b> results")

                                    $scope.allKeywordsObject = $scope.normanize_data(data.data)
                                    $scope.allKeywordsText = $scope.getKeywordsForClipBoard($scope.allKeywordsObject)


                                    for (var i in $scope.allKeywordsObject) {
                                        $scope.addToOrderDict($scope.keyword, $scope.allKeywordsObject[i].text, $scope.allKeywordsObject[i])
                                    }

                                    // alphaBetKeywords : {'obama a':[]}

                                    //  ["", "obama a", "obama b"]

                                    $scope.orderKeywords = $scope.orderKeysByAlphabet($scope.alphaBetKeywords)

                                    // {0: "obama 0", 2: "obama 2"}
                                    $scope.orderKeys = $scope.orderByKeys(keyword, $scope.orderKeywords)

                                    //["0", "2", "5",
                                    $scope.alphabetKeys = $scope.getKeyOrdersFromDic($scope.orderKeys)

                                }else {
                                    $scope.message = "<b>Oops… problem during the request, please try again</b>"

                                }
                                $scope.width_loading = "0%"
                                $scope.calling = false

                            }
                        ).
                            error(function (data, status, headers, config) {
                                $scope.responseTime = (end - start) / 1000
                                $scope.message = "<b>Oops… problem during the request, please try again</b>"

                                $scope.width_loading = "0%"
                                $scope.calling = false
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                            });
                    }
                }
            }
        ]);

       /* myapp.run(['$rootScope', function ($rootScope) {
            var $oldDigest = $rootScope.$digest;
            var $newDigest = function () {
                $oldDigest.apply($rootScope);
                $('[data-toggle="tooltip"]').tooltip()

            };
            $rootScope.$digest = $newDigest;
        }])*/



    /*   myapp.run(['$rootScope', function ($rootScope) {
            var $oldDigest = $rootScope.$digest;
            var $newDigest = function () {
                console.time("$digest");
                $oldDigest.apply($rootScope);
                $('[data-toggle="tooltip"]').tooltip()
                console.timeEnd("$digest");
            };
            $rootScope.$digest = $newDigest;
        }])*/


        angular.bootstrap(document, ['myApp']);
        angular.element(document).on('scroll', function () {
            if (body.scrollTop > 200) {
                $("#tr_text_help_pos_fixed").show()
            } else {
                $("#tr_text_help_pos_fixed").hide()
            }
        });
        $('[data-toggle="tooltip"]').tooltip()
        $("#content_zone").show()

        // Only enable if the document has a long scroll bar
// Note the window height + offset
        if ( ($(window).height() + 100) < $(document).height() ) {
            $('#top-link-block').removeClass('hidden').affix({
                // how far to scroll down before link "slides" into view
                offset: {top:100}
            });
        }


       /* if (getDevice() == "mobile") {
            console.log("show mobi_zone")
            $("#pc_zone").hide()
            $("#mobi_zone").show()
        }
        else {
            console.log("show pc_zone")
            $("#mobi_zone").hide()
            $("#pc_zone").show()
        }*/


    })
;
