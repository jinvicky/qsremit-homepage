function isHtml(str) {
    const tagRe = /<[^>]*>?/g;
    return tagRe.test(str);
}

$(document).ready(function () {
    $('input[type="text"]').attr({
        'data-parsley-trigger': 'change'
    });
});