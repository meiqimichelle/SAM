    // Get current settings
    $.ajax({
        type: "GET",
        url: 'http://127.0.0.1:8124/page?site_name=samHelper&page_name=' +
                encodeURIComponent( pageToken),
        dataType: "html",
    }).done(function(msg) {
      pageConfiguration = JSON.parse(msg);
      if (pageConfiguration.page_help) {
        $('#page-help-text').html(pageConfiguration.page_help);
      }
      $.each(pageConfiguration.form_fields, function(index, field) {
        $('tr.field-record[id="' + field.token + '"] td select[id="' +
                    field.token + '-validator"]').val(field.validator.type);
        $('tr.field-record[id="' + field.token + '"] td textarea[id="' +
                    field.token + '-hint"]').text(field.quickHint);
      });
    }).fail(function() {


        var configAsString = JSON.stringify(pageConfiguration);

        // Post the new data
        $.ajax({
            type: "POST",
            url: 'http://127.0.0.1:8124/page?site_name=samHelper&page_name=' +
                    encodeURIComponent( pageToken),
            dataType: "html",
            data: configAsString
        }).done(function(msg) {
          // console.log(msg);
          alert('Changes saved');
        }).fail(function() {
          alert('failed to ping the file merger');
        });
    });


