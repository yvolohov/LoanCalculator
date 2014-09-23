var yvLoanCalculator =
{
    /* главная функция программы */
    calculate : function()
    {
        var loanSum = Number(this.getNodeProperty("lc_sum", "value", "0"));
        var loanGetDate = this.strToDate(this.getNodeProperty("lc_get_date", "value", "01.01.1970"));
        var loanTerm = Number(this.getNodeProperty("lc_term", "value", "0"));
        var loanPercent = Number(this.getNodeProperty("lc_percent", "value", "0"));
        var loanPayDay = Number(this.getNodeProperty("lc_pay_day", "value", "0"));         
        var paymentSystem = Number(this.getNodeProperty("lc_pay_system", "value", "1"));

        var loanTable = new Array();

        if (paymentSystem === 1)
        {
            loanTable = this.calculateEachMonth(loanSum, loanGetDate, 
                loanTerm, loanPercent, loanPayDay);
        }
        else if (paymentSystem === 2) 
        {
            loanTable = this.calculateEndTerm(loanSum, loanGetDate, 
                loanTerm, loanPercent);
        }

        var div = document.getElementById("lc_table_view");   

        if (div !== null) 
        {        
            this.createLoanTableView(loanTable, div);
        } 
    },    

    /* главная функция блока визуализаци результатов рассчета */
    createLoanTableView : function(loanTable, div)
    {   
        var table = document.createElement("table");
        table.setAttribute("id", "lc_result_table");

        for (var rowCount = 0; rowCount < loanTable.length; rowCount++)
        {
            var tr = document.createElement("tr");
            var rowClass = (rowCount % 2 === 0) ? "lc_even_row" : "lc_odd_row";
            tr.setAttribute("class", rowClass);

            var cells = new Array();
            var columns = loanTable[rowCount].columns;

            for (var cellCount = 0; cellCount < columns; cellCount++)
                {cells[cellCount] = document.createElement("td");}

            if (rowCount === 0) 
                {this.fillHeader(cells, loanTable[rowCount]);}
            else if ((rowCount + 1) < loanTable.length) 
                {this.fillRow(cells, loanTable[rowCount]);}
            else 
                {this.fillAmount(cells, loanTable[rowCount]);}

            for (var cellCount = 0; cellCount < columns; cellCount++)
                {tr.appendChild(cells[cellCount]);}        

            table.appendChild(tr);
        }

        div.innerHTML = "";
        div.appendChild(table);
    },

    fillHeader : function(cells, loanTableRow)
    {
        cells[0].innerHTML = loanTableRow.rowNumber;
        cells[1].innerHTML = loanTableRow.paymentDate;
        cells[2].innerHTML = loanTableRow.loanInitialBalance;
        cells[3].innerHTML = loanTableRow.loanPayment;
        cells[4].innerHTML = loanTableRow.loanFinalBalance;
        cells[5].innerHTML = loanTableRow.paymentDays;
        cells[6].innerHTML = loanTableRow.percent;
        cells[7].innerHTML = loanTableRow.sum;

        for (var count = 0; count < cells.length; count++)
            {cells[count].setAttribute("class", "lc_header_cell");}
    },

    fillRow : function(cells, loanTableRow)
    {
        cells[0].innerHTML = loanTableRow.rowNumber;
        cells[0].setAttribute("class", "lc_short_num_cell");
        cells[1].innerHTML = this.dateToStr(loanTableRow.paymentDate);
        cells[1].setAttribute("class", "lc_date_cell");
        cells[2].innerHTML = loanTableRow.loanInitialBalance.toFixed(2);
        cells[2].setAttribute("class", "lc_long_num_cell");
        cells[3].innerHTML = loanTableRow.loanPayment.toFixed(2);
        cells[3].setAttribute("class", "lc_long_num_cell");
        cells[4].innerHTML = loanTableRow.loanFinalBalance.toFixed(2);
        cells[4].setAttribute("class", "lc_long_num_cell");
        cells[5].innerHTML = loanTableRow.paymentDays;
        cells[5].setAttribute("class", "lc_short_num_cell");
        cells[6].innerHTML = loanTableRow.percent.toFixed(2);
        cells[6].setAttribute("class", "lc_long_num_cell");
        cells[7].innerHTML = loanTableRow.sum.toFixed(2);
        cells[7].setAttribute("class", "lc_long_num_cell");    
    },

    fillAmount : function(cells, loanTableRow)
    {
        cells[0].innerHTML = loanTableRow.rowNumber;
        cells[0].setAttribute("colspan", 3);  
        cells[1].innerHTML = loanTableRow.loanPayment.toFixed(2);  
        cells[3].innerHTML = loanTableRow.paymentDays;    
        cells[4].innerHTML = loanTableRow.percent.toFixed(2);
        cells[5].innerHTML = loanTableRow.sum.toFixed(2);

        for (var count = 0; count < cells.length; count++)
            {cells[count].setAttribute("class", "lc_footer_cell");}    
    },    

    /* главная функция блока расчетов по ежемесячной схеме погашения кредита */
    calculateEachMonth : function(loanSum, loanGetDate, loanTerm, loanPercent, loanPayDay)
    {
        var loanPayment = this.rndNum(loanSum/loanTerm);
        var loanBalance = loanSum;    
        var currentPaymentDate = this.getFirstPaymentDate(loanGetDate, loanPayDay);
        var paymentDays = Math.round((currentPaymentDate - loanGetDate) / 86400000);  

        var table = new Array();
        table[0] = this.getColumnHeads(); // заголовки колонок таблицы
        var amounts = this.getColumnAmounts();

        for (var count = 1; count <= loanTerm; count++)
        {
            table[count] = new Object();
            table[count].rowNumber = count;

            if (count === loanTerm)
            {
                var roundErrSum = Math.round(((loanSum - (loanPayment * loanTerm)) * 100)) / 100;       
                loanPayment += roundErrSum;
            }

            table[count].loanInitialBalance = loanBalance;
            table[count].loanPayment = loanPayment;

            /* остаток кредита после проплаты */
            loanBalance = this.rndNum(loanBalance - loanPayment);
            table[count].loanFinalBalance = loanBalance;       

            table[count].paymentDate = currentPaymentDate;
            table[count].paymentDays = paymentDays;

            /* рассчет процентов за период */
            table[count].percent = this.rndNum(((table[count].loanInitialBalance * 
                loanPercent) / (365 * 100)) * table[count].paymentDays);

            /* весь платеж за период - кредит и проценты */
            table[count].sum = this.rndNum(table[count].loanPayment + table[count].percent);
            table[count].columns = 8;

            /* итоги */
            amounts.loanPayment += table[count].loanPayment;
            amounts.paymentDays += table[count].paymentDays;
            amounts.percent += table[count].percent;
            amounts.sum += table[count].sum;

            currentPaymentDate = this.getNextPaymentDate(currentPaymentDate, loanPayDay);
            paymentDays = Math.round((currentPaymentDate - table[count].paymentDate) / 86400000);
        }

        table[loanTerm + 1] = amounts; 
        return table;
    },

    setNodeProperty : function(elementId, propertyName, propertyValue)
    {
        var elem = document.getElementById(elementId);

        if (elem !== null)
        {
            elem[propertyName] = propertyValue;
        } 
    },

    getNodeProperty : function(elementId, propertyName, defValue)
    {
        var elem = document.getElementById(elementId);

        if (elem !== null) 
        {
            var value = elem[propertyName];

            if (value === null) 
                {value === defValue;}    

            return value;
        }

        return defValue;
    },

    getFirstPaymentDate : function(loanGetDate, loanPayDay)
    {
        var year = loanGetDate.getFullYear();
        var month = loanGetDate.getMonth();
        var daysInMonth = (new Date(year, month + 1, 0)).getDate();   

        /* если день оплаты больше чем день конца месяца, то 
         * день оплаты назначается на день конца месяца */
        var paymentDay = Math.min(daysInMonth, loanPayDay);

        var paymentDate = new Date(year, month, paymentDay);   
        var getDay = loanGetDate.getDate();

        /* первая оплата по кредиту будет в следующем месяце
         * за тем месяцем, в котором кредит получен */
        if (paymentDay <= getDay)
        {
            paymentDate.setMonth(paymentDate.getMonth() + 1);
        }

        return paymentDate;
    },

    getNextPaymentDate : function(previousPaymentDate, loanPayDay)
    {    
        /* получаем первый день следующего месяца */
        var nextDate = new Date
        (
            previousPaymentDate.getFullYear(), 
            previousPaymentDate.getMonth() + 1, 
            1
        );

        var daysInMonth = (new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0)).getDate();    
        var paymentDay = Math.min(daysInMonth, loanPayDay);    
        nextDate.setDate(paymentDay);

        return nextDate;
    },

    getColumnHeads : function()
    {
        var cells = new Object();    
        cells.rowNumber = "№ п/п";
        cells.paymentDate = "Дата платежа";
        cells.loanInitialBalance = "Начальный остаток";
        cells.loanPayment = "Оплата по кредиту";
        cells.loanFinalBalance = "Конечный остаток";    
        cells.paymentDays = "Период (дней)";
        cells.percent = "Проценты за период";    
        cells.sum = "Итого за период";
        cells.columns = 8;
        return cells;
    },

    getColumnAmounts : function()
    {
        var cells = new Object();    
        cells.rowNumber = "Итого:";
        cells.loanPayment = 0;    
        cells.paymentDays = 0;
        cells.percent = 0;    
        cells.sum = 0;
        cells.columns = 6;
        return cells;    
    },    

    /* главная функция блока расчетов по схеме погашения кредита в конце срока */
    calculateEndTerm : function(loanSum, loanGetDate, loanTerm, loanPercent)
    {
        var year = loanGetDate.getFullYear();
        var month = loanGetDate.getMonth();
        var day = loanGetDate.getDate();
        var paymentDate = new Date(year, month + loanTerm, day);
        var paymentDays = Math.round((paymentDate - loanGetDate) / 86400000);

        var table = new Array();
        table[0] = this.getColumnHeads(); // заголовки колонок таблицы

        table[1] = new Object();
        table[1].rowNumber = 1;
        table[1].paymentDate = paymentDate;
        table[1].loanInitialBalance = loanSum;
        table[1].loanPayment = loanSum;
        table[1].loanFinalBalance = 0;
        table[1].paymentDays = paymentDays;   
        table[1].percent =  this.rndNum(((table[1].loanInitialBalance * 
            loanPercent) / (365 * 100)) * table[1].paymentDays);     
        table[1].sum = this.rndNum(table[1].loanPayment + table[1].percent);
        table[1].columns = 8;

        table[2] = this.getColumnAmounts(); // итоги колонок таблицы
        table[2].loanPayment = table[1].loanPayment;
        table[2].paymentDays = table[1].paymentDays;
        table[2].percent = table[1].percent;
        table[2].sum = table[1].sum;

        return table;    
    },    

    /* главная функция блока заполнения начальных значений 
     * в форме при загрузке страницы */
    initBeginValues : function()
    {
        var loanSum = 1000;
        var loanDate = new Date();
        var loanTerm = 12; // in months
        var percent = 25;
        var paymentSystem = 1; // 1 or 2
        var paymentDay = (loanDate.getDate()).toString(); // from 1 to 31

        this.setNodeProperty("lc_sum", "value", loanSum.toString());    
        this.setNodeProperty("lc_get_date", "value", this.dateToStr(loanDate));   
        this.setNodeProperty("lc_term", "value", loanTerm.toString());
        this.setNodeProperty("lc_percent", "value", percent.toString());     
        this.setNodeProperty("lc_pay_system", "value", paymentSystem.toString());    
        this.setNodeProperty("lc_pay_day", "value", paymentDay);
        this.enableElements();
    },

    enableElements : function()
    {
        var paymentSystem = Number(this.getNodeProperty("lc_pay_system", "value", "1"));
        var payDay = document.getElementById("lc_pay_day");

        if (payDay !== null)
        {
            payDay.disabled = (paymentSystem > 1);
        }
    },    

    /* общие функции */
    rndNum : function(number)
    {
        return (Math.round(number * 100)) / 100;
    },

    dateToStr : function(date)
    {
        var day = date.getDate();
        day = ((day < 10) ? "0" : "") + day.toString();

        var month = date.getMonth() + 1;
        month = ((month < 10) ? "0" : "") + month.toString();

        var year = date.getFullYear();
        year = year.toString();

        return day + "." + month + "." + year;
    },

    strToDate : function(string)
    {
        var day = Number(string.substr(0, 2));
        var month = Number(string.substr(3, 2));
        var year = Number(string.substr(6, 4));
        return new Date(year, month - 1, day);    
    }    
};