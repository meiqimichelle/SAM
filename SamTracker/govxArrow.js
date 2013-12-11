function setArrowProperties( arrows, propertiesForIds ) {
    propertiesForIds.forEach( function(propertiesForId) {
        arrows.some( function(arrow) {
            if (arrow.id === propertiesForId.id) {
                for ( prop in propertiesForId ) {
                    arrow[prop] = propertiesForId[prop];
                }
                return true;
            }
        });
    });
}

function Arrow( spec  ) {
    if (arguments.length !== 1 || !(arguments[0] instanceof Object)) {
        throw 'Arrow() must have 1 argument of type Object';
    }
    [ 'thickness', 'length', 'id' ].forEach( function(prop) {
        if ( ! this[prop] ) { throw prop + ' is a required property'; }
    }, arguments[0]);

    var id = spec.id;
    var thickness = spec.thickness;
    var length = spec.length;
    var fillColor = spec.fillColor;
    var textColor = spec.textColor;
    var help = spec.help;
    var label = spec.label ? spec.label : "";
    var scale = thickness / 100.0;
    var arrowPathTemplate = 'M0,20 l STEMLENGTH,0, l 0, -20 l 40,40 l ' +
                            '-40,40  l 0, -20 l-STEMLENGTH,0z ';
    
    Object.defineProperty(this, 'id', {
        get: function() { return id; }
    });
    Object.defineProperty(this, 'length', {
        get: function() { return length; },
        set: function(value) {
            length = value;
            $('div.arrow-div#' + this.id + '-arrow-div svg.arrow-svg').
                css('width', scale * length);
            $('div.arrow-div#' + this.id + '-arrow-div svg.arrow-svg g.arrow-g path').
                attr('d', arrowPathTemplate.replace(/STEMLENGTH/g, length - 40));
        }
    });
    Object.defineProperty(this, 'thickness', {
        get: function() { return thickness; },
        set: function(value) {
            thickness = value;
            scale = thickness / 100.0;
            $('div.arrow-div#' + this.id + '-arrow-div svg.arrow-svg g.arrow-g path').
                attr('d', arrowPathTemplate.replace(/STEMLENGTH/g, length - 40));
        }
    });
    Object.defineProperty(this, 'label', {
        get: function() { return label; },
        set: function(value) {
            label = value;
            $('div.arrow-div#' + this.id + '-arrow-div svg.arrow-svg g.arrow-g path').
                attr('d', arrowPathTemplate.replace(/STEMLENGTH/g, length - 40));
        }
    });
    Object.defineProperty(this, 'fillColor', {
        get: function() { return fillColor; },
        set: function (newColor) {
            fillColor = newColor;
            $('path.arrow-path#' + this.id +  '-arrow-path').css('fill', fillColor);
        }
    });
    Object.defineProperty(this, 'textColor', {
        get: function() { return textColor; },
        set: function (newColor) {
            textColor = newColor;
            $('text.arrow-text#' + this.id +  '-arrow-text').css('fill', textColor);
        }
    });
    Object.defineProperty(this, 'help', {
        get: function() { return help; },
        set: function (value) {
            help = value;
        }
    });
    Object.defineProperty(this, 'html', {
        get: function() {
        return '<div class="arrow-div" id="' + this.id + '-arrow-div">' +
        '<svg xmlns="http://www.w3.org/2000/svg" ' + 'class="arrow-svg" id="' +
        this.id + '-arrow-svg" ' + 'version="1.1" style="' + 'width:' +
        scale * length + '; ' + 'height:' + this.thickness + ';">' +
        '<g class="arrow-g"' + ' id="' + this.id + '-arrow-g" ' +
        'transform="scale(' + scale + ')">' +
        '<path d="' + arrowPathTemplate.replace(/STEMLENGTH/g, length - 40) +
        '" class="arrow-path"' + ' id="' + this.id + '-arrow-path" ' + 'style="' +
        'stroke:black; stroke-width:1; fill:' + fillColor +';"/>' +
        '<text x="10" y="40" fill="' + textColor + '" class="arrow-text"' +
        ' id="' + this.id + '-arrow-text" transform="scale(1.1)">' + this.label +
        '</text></g></svg></div>';
        }
    });
}
