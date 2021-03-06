var linkRegex = /(.*)(https?:\/[-a-zA-Z0-9+&@#\/()%?=~_|!:,.;]*[-a-zA-Z0-9+&@#\/()%=~_|])((.|\n)*)/;

var appendLinkToDescription = function (description, href, linkText) {
    var a = document.createElement('a');
    a.href = href;
    a.target = "_blank";
    a.innerHTML = linkText;
    description.appendChild(a);
};

var appendSpanWithInnerText = function (parent, text) {
    var span = document.createElement('span');
    span.innerHTML = text;
    parent.appendChild(span);
};

var extractDecodedLinkFromString = function (str) {
    var link = str.match(linkRegex)[2];
    return link.replace(/&amp;/g, '&');
};

var waitForStackTraceAndLink = function (stackContainer) {
    var stackTraceWrapper = stackContainer.getElementsByClassName("fullStacktrace")[0];
    if (stackTraceWrapper && stackTraceWrapper.innerHTML) {
        var stackTrace = stackTraceWrapper.innerHTML;
        if (stackTrace.indexOf("https://eyes.applitools.com") == -1) {
            return;
        }

        stackTraceWrapper.innerHTML = "";
        var beforeURL = stackTrace.match(linkRegex)[1];
        var decodedLink = extractDecodedLinkFromString(stackTrace);
        var afterUrl = stackTrace.match(linkRegex)[3];
        appendSpanWithInnerText(stackTraceWrapper, beforeURL);
        appendLinkToDescription(stackTraceWrapper, decodedLink, decodedLink);
        appendSpanWithInnerText(stackTraceWrapper, afterUrl);
    } else {
        setTimeout(waitForStackTraceAndLink, 500, stackContainer);
    }
};

var getBuildScriptProblemWrapperWhenCollapsed = function (expandCollapseContainer) {
    var buildScriptProblems = expandCollapseContainer.children;
    for (var currChild = 0; currChild < buildScriptProblems.length; currChild++) {
        var child = expandCollapseContainer.children[currChild];
        var problemType = child.getElementsByClassName("problemType")[0];
        if (problemType.innerHTML == "Problem reported from build script") {
            return expandCollapseContainer.children[currChild];
        }
    }
};

var linkBuildProblems = function () {
    var expandCollapseContainer = document.getElementsByClassName("expandCollapseContainer")[0];
    var buildScriptProblemsWrapper = expandCollapseContainer ?
        getBuildScriptProblemWrapperWhenCollapsed(expandCollapseContainer) : document.getElementsByClassName("buildProblemsList")[0];
    var problemDescriptions = buildScriptProblemsWrapper.getElementsByClassName("problemDescription");
    var numOfProblems = problemDescriptions.length;
    for (var i = 0; i < numOfProblems; i++) {
        var descriptionText = problemDescriptions[i].innerHTML;
        if (descriptionText.indexOf("http") == -1) {
            return;
        }

        var decodedLink = extractDecodedLinkFromString(descriptionText);
        problemDescriptions[i].innerHTML = descriptionText.match(linkRegex)[1];
        appendLinkToDescription(problemDescriptions[i], decodedLink, "link");
    }
};

var linkStackTrace = function () {
    var testLists = document.getElementById("idfailedDl").getElementsByClassName("testList");
    var numOfTestLists = testLists.length;
    for (var currTestList = 0; currTestList < numOfTestLists; currTestList++) {
        var testsCollection = testLists[currTestList].rows;
        var testsArray = [].slice.call(testsCollection);
        var numOfTests = testsArray.length;
        for (var currTestTableRow = 0; currTestTableRow < numOfTests; currTestTableRow++) {
            var testWithDetailsWrapper = testsArray[currTestTableRow].getElementsByClassName("testWithDetails")[0];
            if (testWithDetailsWrapper && !testsArray[currTestTableRow].id) {
                testWithDetailsWrapper.click();
                testWithDetailsWrapper.click();
                waitForStackTraceAndLink(testsArray[currTestTableRow].nextSibling);
            } else if (testsArray[currTestTableRow].getElementsByClassName("fullStacktrace")[0]) {
                waitForStackTraceAndLink(testsArray[currTestTableRow]);
            }
        }
    }
};

linkBuildProblems();
linkStackTrace();




