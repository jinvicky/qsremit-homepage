$(document).ready(function() {
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content');

    let tbody = $('#reportListBody');

    tbody.on('change', '.report-status-toggle', function() {
        const $this = $(this);
        const reportId = $this.data('id');
        const isChecked = $this.prop('checked');

        if (confirm(isChecked
            ? 'Are you sure you want to activate this report?'
            : 'Are you sure you want to disable this report?')) {

            $.ajax({
                type: 'PUT',
                url: '/systemManagement/reportManagement/status',
                contentType: 'application/json',
                dataType: 'text',
                data: JSON.stringify({
                    id: reportId,
                    mailingStatus: isChecked
                }),
                xhrFields: {
                    withCredentials: true
                },
                beforeSend: function(xhr){
                    xhr.setRequestHeader(header, token);
                },
                success: function(res) {
                    if (res === 'success') {
                        alert(isChecked
                            ? 'Report have been activated successfully.'
                            : 'Report have been disabled successfully.');
                    } else {
                        $this.prop('checked', !isChecked);
                        alert('Unexpected response received.');
                    }
                },
                error: function(xhr, status, error) {
                    $this.prop('checked', !isChecked);
                    alert(isChecked
                        ? 'Failed to activate report: ' + (xhr.statusText || 'Unknown error')
                        : 'Failed to disable report: ' + (xhr.statusText || 'Unknown error'));
                }
            });
        } else {
            $this.prop('checked', !isChecked);
        }

    });
});