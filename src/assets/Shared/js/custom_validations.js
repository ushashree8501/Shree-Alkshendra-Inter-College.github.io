jQuery.validator.unobtrusive.adapters.add("imagefile", function (options) {
    options.rules["imagefile"] = true;
    if (options.message) {
        options.messages['imagefile'] = options.message;
    };
});
jQuery.validator.addMethod('imagefile', function (value, element, param) {
    if (element.files != undefined && element.files[0] != undefined && element.files[0].size != undefined) {
        var file = element.files[0];
        var fileType = file["type"];
        var validImageTypes = ["image/jpeg", "image/png"];
        if ($.inArray(fileType, validImageTypes) >= 0) {
            return true;
        }
    }
    else {
        return true;
    }
});


jQuery.validator.unobtrusive.adapters.add("allowedfiletypes", ["mimetypes"], function (options) {
    var params = { mimetypes: options.params.mimetypes };
    options.rules['allowedfiletypes'] = params;
    if (options.message) {
        options.messages['allowedfiletypes'] = options.message;
    };
});
jQuery.validator.addMethod('allowedfiletypes', function (value, element, param) {

    if (element.files != undefined && element.files[0] != undefined && element.files[0].size != undefined) {
        var file = element.files[0];
        var fileType = file["type"];
        var validFileTypes = param.mimetypes.split(",");
        if ($.inArray(fileType, validFileTypes) >= 0) {
            return true;
        }
        else {
            return false;
        }
    }
    else {
        return true;
    }
});





jQuery.validator.unobtrusive.adapters.add("urlvalidator", function (options) {
    options.rules['urlvalidator'] = true;
    if (options.message) {
        options.messages['urlvalidator'] = options.message;
    };
});
jQuery.validator.addMethod('urlvalidator', function (value, element) {
    if (value === "" || value == null) {
        return true;
    }
    else {
        let url;
        try {
            url = new URL(value);
        } catch (_) {
            return false;
        }
        return true;
    }
});





jQuery.validator.unobtrusive.adapters.add("maxfilesize", ["allowedfilesize"], function (options) {
    var params = { allowedfilesize : options.params.allowedfilesize }
    options.rules['maxfilesize'] = params;
    if (options.message) {
        options.messages['maxfilesize'] = options.message;
    };
});
jQuery.validator.addMethod('maxfilesize', function (value, element, param) {
    if (element.files != undefined && element.files[0] != undefined && element.files[0].size != undefined) {
        var file = element.files[0];
        if (file.size <= param.allowedfilesize) {
            return true;
        }
        else {
            return false;
        }
    }
    else {
        return true;
    }
});