$(document).ready(function () {
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content');

    $.ajaxSetup({
        xhrFields: {
            withCredentials: true
        },
        beforeSend: function(xhr) {
            xhr.setRequestHeader(header, token);
        }
    })

    const editor = new DataTable.Editor({
        ajax: {
            create: {
                type: 'POST',
                url: '/transaction/transactionSubsidiaryInformation',
                contentType: 'application/json',
                data: function (data) {
                    const {type, english} = Object.values(data.data)[0];
                    return JSON.stringify({
                        type, english
                    });
                },
                success: function () {
                    location.reload();
                    editor.close();
                },
                error: function (xhr, status, error) {
                    console.log("Error Message:", error);
                }
            },
            edit: {
                type: 'PUT',
                url: '/transaction/transactionSubsidiaryInformation/{id}',
                contentType: 'application/json',
                data: function (data) {
                    const id = String(Object.keys(data.data)[0]);
                    const editedItem = Object.values(data.data)[0];

                    const originalData = table
                        .rows()
                        .data()
                        .toArray()
                        .find((row) => row.id === id);

                    const fullUpdateData = {
                        id: id,
                        type: editedItem.type !== undefined ? editedItem.type : originalData.type,
                        english: editedItem.english !== undefined ? editedItem.english : originalData.english
                    };
                    return JSON.stringify(fullUpdateData);
                },
                success: function () {
                    location.reload()
                },
                error: function (xhr, status, error) {
                    console.log("Error Message:", error);
                }
            },
        },
        fields: [
            {
                label: "Type <span style=\"color: red;\">*</span>",
                name: "type",
                type: "select",
                options: [
                    {
                        label: "Source of Income",
                        value: "Source of Income",
                    },
                    {
                        label: "Relation to Beneficiary",
                        value: "Relation to Beneficiary",
                    },
                    {
                        label: "Purpose of remittance",
                        value: "Purpose of remittance",
                    },
                    {
                        label: "Customer Type",
                        value: "Customer Type",
                    },
                    {
                        label: "Occupation",
                        value: "Occupation",
                    },
                    {
                        label: "Visa",
                        value: "Visa",
                    },
                ]
            },
            {
                label: "English <span style=\"color: red;\">*</span>",
                name: "english",
            }
        ],
        idSrc: "id",
        table: "#subsidiaryTable",
    });

    let rowNum = 1;

    const table = new DataTable("#subsidiaryTable", {
        rowId: "id",
        columns: [
            { data: null, orderable: false, render: DataTable.render.select(), width: "5%" },
            {
                data: null,
                title: "No.",
                width: "5%",
                orderable: false,
            },
            {data: "id", visible: false},
            {data: "type", width: "20%"},
            {data: "english"},
        ],
        columnDefs: [
            { targets: [1], className: "dt-head-center dt-body-center" },
            { targets: [3], className: "dt-head-left dt-body-left" },
            { targets: [4], className: "dt-head-left dt-body-left" },
        ],
        rowGroup: {
            dataSrc: 'type',
            startRender: function (rows, group) {
                return $('<tr/>')
                    .append('<td colspan="7" style="background:#f9f9f9; font-weight:bold;">' + group + '</td>');
            }
        },
        lengthMenu: [
            [50, 100, -1],
            [50, 100, 'All']
        ],
        rowCallback: function (row, data, index) {
            const pageInfo = this.api().page.info();
            const reverseIndex = pageInfo.recordsDisplay - (pageInfo.page * pageInfo.length) - index;
            $('td:eq(1)', row).html(reverseIndex);
        },
        initComplete: function () {
            const api = this.api();
            api.columns(3)
                .every(function () {
                    const column = this;
                    const select = document.createElement("select");
                    select.add(new Option("Select", "")); // 빈 옵션 추가
                    select.classList.add("form-select");
                    column
                        .data()
                        .unique()
                        .sort()
                        .each(function (d) {
                            select.add(new Option(d, d));
                        });

                    $("#informationSelect").html(select);
                });
            $(".dt-button").removeClass("dt-button");
            initializeTableResize(this, {
                minWidth: 40,
                excludeLastColumns: 1
            })
        },
        createdRow: function (row) {
            const targetColumns = [2, 3];

            targetColumns.forEach((columnIndex) => {
                $(row).find(`td:eq(${columnIndex})`).css('background-color', '#fff4cc');
            });
        },
        select: {
            style: 'multi',
            selector: 'td:first-child'
        },
        order: [[3, 'asc']],
        layout: {
            topEnd: {
                buttons: [
                    {
                        extend: "excel",
                        text: "Export to Excel",
                        className: 'btn btn-soft-secondary',
                        title: null,
                        filename: function () {
                            const date = moment().format('YYMMDD');
                            const randomNumber = Math.floor(Math.random() * 10000);
                            return `subsidiaryInformation_${date}_${randomNumber}`;
                        },
                        exportOptions: {
                            columns: ":not(:first-child)",
                            format: {
                                body: function (data, row, column) {
                                    // No 컬럼 처리
                                    if (column === 1) {
                                        return rowNum++;
                                    }
                                    // HTML 태그 제거
                                    if (typeof data === 'string') {
                                        return data.replace(/<[^>]+>/g, ' ')
                                            .replace(/\n/g, ' ')
                                            .trim();
                                    }
                                    return data;
                                }
                            }
                        },
                        customize: function () {
                            rowNum = 1;
                        }
                    },
                    {
                        text: 'Delete',
                        action: function () {
                            deleteData();
                        },
                        className: 'btn btn-danger'
                    },
                    {
                        extend: "create",
                        editor: editor,
                        className: 'btn btn-outline-primary width-l',
                        text: "New Subsidiary Information",
                        action: function () {
                            editor.create({
                                title: "Create New",
                                buttons: [
                                    {
                                        label: "Save",
                                        className: "btn btn-primary",
                                        fn: function () {
                                            this.submit();
                                        }
                                    },
                                    {
                                        label: "Cancel",
                                        className: "btn btn-secondary",
                                        fn: function () {
                                            this.close();
                                        }
                                    }
                                ]
                            });
                        }
                    },
                ]
            }
        },
    });

    table.on('click', 'tbody td', function () {
        try {
            editor.inline(this);
        } catch (error) {
            console.error(error);
        }
    });

    editor.on('preSubmit', function (e, o, action) {
        const english = this.field('english');

        english.error('');

        if (action !== 'remove') {
            if (!english.isMultiValue()) {
                if (!english.val()) {
                    english.error('A English must be given');
                }
            }

            if (isHtml(english.val())) {
                english.error("HTML tag characters (<, >) are not allowed. Please use [], {}, or () instead.");
            }

            if (this.inError()) {
                return false;
            }
        }
    });

    $("#search-btn").on("click", function () {
        // 각 필터 값 가져오기
        const infoType = $("#informationSelect select").val();

        // 필터 초기화
        table.columns().search("");

        // 정보 유형 필터 적용
        if (infoType) {
            table.column(3).search(infoType, true, false);
        }
        table.draw();
    });
    $(document).on("keypress", function(e) {
        if (e.keyCode === 13 || e.which === 13) {
            e.preventDefault();
            $("#search-btn").trigger("click");
        }
    });

    function deleteData() {
        const selectedIds = table.rows({ selected: true }).data().toArray().map(row => row.id);

        if (selectedIds.length === 0) {
            alert('Please select at least one row to delete.');
            return;
        }

        $.ajax({
            method: 'DELETE',
            url: `/transaction/transactionSubsidiaryInformation`,
            contentType: 'application/json',
            data: JSON.stringify({
                ids: selectedIds
            }),
            success: function () {
                alert("Deposit Branch delete successfully.")
                location.reload();
            },
            error: function (xhr, status, error) {
                console.error("Error Message:", error);
                alert("Error occurred while deleting data. Please try again.");
            }
        });
    }

    $("#downloadFormButton").on("click", function () {
        fetch('/api/subsidiaryInformation/excel/download', {
            method: 'GET',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.blob();
            })
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'account_deposit_address_form.xlsx';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            })
            .catch(error => {
                console.error('Error downloading file:', error);
                alert('Error downloading file.');
            });
    })

    $("#uploadExcelButton").on("click", function () {
        const fileInput = $('<input type="file" accept=".xls,.xlsx,.csv" style="display:none">');
        $("body").append(fileInput);
        fileInput.click();

        fileInput.on('change', function(e) {
            $('#loadingSpinner').show();

            const file = e.target.files[0];
            if (!file) {
                alert("No File Selected");
                $('#loadingSpinner').hide();
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            $.ajax({
                url: '/api/subsidiaryInformation/excel/upload',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function (data) {
                    location.reload();
                },
                error: function (xhr) {
                    alert(xhr.responseJSON.error)
                },
                complete: function() {
                    $('#loadingSpinner').hide();
                }
            })

            fileInput.val('');
        });
    })

    table.on('length.dt', function(e, settings, len) {
        $("#tablePageInput").val(len);
    });

    setTimeout(() => {
        const pageLength = $("#tablePageInput").val() || 50;
        table.page.len(pageLength);
    }, 0);
});