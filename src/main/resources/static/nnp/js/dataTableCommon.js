function initializeDataTable(tableId, ajaxUrl, columns) {
	return new DataTable(tableId, {
        ajax: {
            url: ajaxUrl, 
            dataSrc: 'data',
        },
        scrollY: '350px',
        scrollX: true,
        scrollCollapse: true, 
        searching: true,
        rowId: 'no',
        columns: columns,
    });
}

function searchTable(table, filterName, columnIndex) {
	const value = $(filterName).val().trim();
	table.column(columnIndex).search(d => d.includes(value)).draw();
}
function searchTableWithText(table, filterName, columnIndex) {
	let value = $(filterName).text().trim().replace("Å", "A");
	value = value !== 'Select' ? value : '';
	table.column(columnIndex).search(d => d.includes(value)).draw();
}

function searchDateInTable(start, end, columnIndex) {
	let hasShownError = false;
	$.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
	    const startDate = new Date($(start).val());
	    const endDate = new Date($(end).val());

		// 시간 부분을 설정 (시작은 00:00:00, 종료는 23:59:59)
		startDate.setHours(0, 0, 0, 0);
		endDate.setHours(23, 59, 59, 999);

		const date = moment(data[columnIndex], "YYYY-MM-DD").toDate();

	    const isStartDateValid = !isNaN(startDate.getTime());
	    const isEndDateValid = !isNaN(endDate.getTime());
	    const isDateValid = !isNaN(date.getTime());

		// Reset error flag if range is corrected
		if (isStartDateValid && isEndDateValid && startDate <= endDate) {
			hasShownError = false; // Reset the error flag
		}

		// Check if End Date is earlier than Start Date
		if (isStartDateValid && isEndDateValid && endDate < startDate) {
			if (!hasShownError) {
				alert("The end date must be later than the start date. Please select a valid date range.");
				hasShownError = true; // Prevent multiple alerts
			}
			return false;
		}

		// Check date range logic
		if (isStartDateValid && date < startDate) {
			return false;
		}

		if (isEndDateValid && date > endDate) {
			return false;
		}

	    return true;
	});
}

function searchTableByButtons(table, buttonsName, colunmIndex) {
	$(buttonsName).each(function() {
	    $(this).on("click", function() {
	        $(buttonsName).each(function() {
	            $(this).removeClass("btn-primary").addClass("btn-outline-primary");
	        });

	        $(this).addClass("btn-primary").removeClass("btn-outline-primary");
			
			let val = ""
			if ($(this).val() !== "All") val = $(this).val()
			table.column(colunmIndex).search(d => d.includes(val));
			table.draw()
	    });
	});
}
// 값 포맷 함수
function formatDecimal(value) {
	if (value === null || value === undefined) return "";

	const num = Number(value);
	if (num === 0) return "0";

	return num.toFixed(10).replace(/\.?0+$/, "");
}

function clickEditButton(table, editor) {
	table.on("click", "tbody span.edit", function (e) {
		e.preventDefault();
		const row = $(this).closest("tr");

		const cells = table.cells(row, "*").nodes();
		const data = table.row(row).data();

		// 각 필드에 대해 포맷을 적용
		Object.keys(data).forEach(function(key) {
			if (key === "branchCode") {
				data[key] = data[key].toString();
			} else if (data[key] && !isNaN(data[key])) {
				data[key] = formatDecimal(data[key]);
			} else {
				data[key] = unescapeSpecialCharacters(data[key]) || "";
			}
		});

		editor.inline(cells, {
			cancelHtml: "<i class='fa fa-times' style='font-size: 1.5em;'></i>",
			cancelTrigger: "span.cancel",
			submitHtml: "<i class='fa fa-save' style='font-size: 1.5em;'></i>",
			submitTrigger: "span.edit",
			onSubmit: function() {
				const editedData = editor.get();
				editedData.data.headOfficeUsdJpy = formatDecimal(editedData.data.headOfficeUsdJpy);
				editedData.data.headOfficeCost = formatDecimal(editedData.data.headOfficeCost);
				editedData.data.headOfficeMargin = formatDecimal(editedData.data.headOfficeMargin);
			}
		});
	});
}

function clickRemoveButton(table, editor) {
	table.on("click", "tbody span.remove", function (e) {

	    editor.remove(this.closest("tr"), {
	        title: "Delete record",
	        message: "Are you sure you wish to delete this record?",
	        buttons: "Delete"
	    });
	});
}

function initializeTableResize(table, options = {}) {
	const {
		minWidth = 40,
		excludeLastColumns = 1
	} = options;

	let isResizing = false;
	let currentTh = null;
	let startX, startWidth;

	const headers = $(table).find('thead th');

	// 리사이즈 핸들 추가
	headers.each(function (index) {
		if (index < headers.length - excludeLastColumns) {
			const handle = $('<div class="dt-resize-handle"></div>');
			$(this).css('position', 'relative').append(handle);
		}
	});

	// 컬럼 리사이즈 이벤트 핸들러
	$(document)
		.on('mousedown', '.dt-resize-handle', function (e) {
			isResizing = true;
			currentTh = $(this).parent();

			startX = e.pageX;
			startWidth = currentTh.width();

			$(this).addClass('dragging');
			currentTh.addClass('dt-resize-hover');

			e.preventDefault();
		})
		.on('mousemove', function (e) {
			if (!isResizing) return;

			const width = startWidth + (e.pageX - startX);
			if (width >= minWidth) {
				currentTh.width(width);
				table.api().columns.adjust();
			}
		})
		.on('mouseup', function () {
			if (!isResizing) return;

			isResizing = false;
			$('.dt-resize-handle').removeClass('dragging');
			currentTh.removeClass('dt-resize-hover');
			currentTh = null;

			table.api().columns.adjust();
		});
}
