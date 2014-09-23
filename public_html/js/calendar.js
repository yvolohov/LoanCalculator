function yvCalendar(input)
{
    /* Это дата, полученная с элемента input */
    var inputDate = new Date();
    
    if (input.value !== "")
    {
        try {inputDate = this.model.strToDate(input.value);}
        catch(e) {inputDate = new Date();}
    }
       
    /* Это внешний div, в котором находится input и календарь */ 
    this.parent = input.parentElement;
    this.parent.yvc_obj = this;
    
    /* Это input, в который вводится дата */
    this.input = input;
    this.input.onclick = this.onInputClick;
    
    /* Это дата первого дня месяца, который отображается в календаре */
    this.date = new Date(inputDate.getFullYear(), inputDate.getMonth(), 1);
    
    /* Это дата дня, который выбран в календаре */
    this.choosedDate = inputDate;
    
    /* Свернут календарь или развернут */
    this.opened = false;
}

yvCalendar.prototype = 
{
    onInputClick : function(event)
    {
        event = event || window.event;
        var input = event.target || event.srcElement;
        var obj = input.parentElement.yvc_obj;     
        obj.opened = !(obj.opened);
        obj.reloadCalendarView();
    },
    
    onClick : function(event)
    {
        event = event || window.event;
        var cell = event.target || event.srcElement;
        var div = cell.parentElement.parentElement.parentElement;
        var obj = div.yvc_obj;
        
        switch (cell.yvc_id)
        {
            case "active_day":
                obj.setDate(obj, cell.yvc_date, true);
                break;
            
            case "inactive_day":               
                obj.setDate(obj, cell.yvc_date, false);
                break;
            
            case "minus_year":
                obj.addPeriod(obj, "y", -1);                
                break;
            
            case "plus_year":
                obj.addPeriod(obj, "y", 1);                
                break;
            
            case "minus_month":
                obj.addPeriod(obj, "m", -1);                
                break;
            
            case "plus_month":               
                obj.addPeriod(obj, "m", 1);
                break;          
            
            case "to_select_date":
                obj.setDate(obj, obj.choosedDate, false);
                break;
        }
    },
    
    setDate : function(obj, date, toInput)
    {
        obj.date = new Date(date.getFullYear(), date.getMonth(), 1);
        obj.choosedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        if (toInput)
        {
            obj.input.value = obj.model.dateToStr(obj.choosedDate);
            obj.opened = false;
        }
        
        obj.reloadCalendarView();        
    },
    
    addPeriod : function(obj, period, count)
    {
        if (period === "y") 
            {obj.date.setFullYear(obj.date.getFullYear() + count);}
        else if (period === "m")
            {obj.date.setMonth(obj.date.getMonth() + count);}
        obj.reloadCalendarView();
    },

    reloadCalendarView : function()
    {
        var tables = this.parent.getElementsByTagName("table");
        
        for (var count = 0; count < tables.length; count++)
            {this.parent.removeChild(tables[count]);}
        
        if (!this.opened) return;
        
        var table = document.createElement("table");
        table.setAttribute("class", "yvc_table");   
        this.addFirstHeaderView(table);
        this.addSecondHeaderView(table);
        this.addDaysView(table);
        this.addFooterView(table);        
        this.parent.appendChild(table);
    }, 
    
    addFirstHeaderView : function(table)
    {
        var tr = document.createElement("tr");
        var cells = new Array();
        var ids = ["minus_year", "minus_month", "select_month", 
            "plus_month", "plus_year"];
        
        for (var count = 0; count < 5; count++)
        {
            cells[count] = document.createElement("td");
            cells[count].setAttribute("class", "yvc_first_header");
            cells[count].yvc_id = ids[count];
            cells[count].yvc_obj = this;
            cells[count].onclick = this.onClick;          
        }
        
        cells[0].innerHTML = "&lt&lt";
        cells[1].innerHTML = "&lt";
        cells[2].innerHTML = this.model.getMonthStr(this.date);
        cells[2].setAttribute("class", "yvc_second_header");
        cells[2].setAttribute("colspan", "3");
        cells[3].innerHTML = "&gt";
        cells[4].innerHTML = "&gt&gt";
             
        for (var count = 0; count < 5; count++)
            {tr.appendChild(cells[count]);}
        
        table.appendChild(tr);
    },
    
    addSecondHeaderView : function(table)
    {
        var days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
        var tr = document.createElement("tr");
        
        for (var count = 0; count < days.length; count++)
        {
            var td = document.createElement("td");
            td.innerHTML = days[count];
            td.setAttribute("class", "yvc_second_header");
            tr.appendChild(td);
        }        
        table.appendChild(tr);
    },
    
    addDaysView : function(table)
    {
        var daysArray = this.model.getDaysArray(this.date, this.choosedDate);

        for (var rowCount = 0; rowCount < daysArray.length; rowCount++)
        {
            var tr = document.createElement("tr");

            for (var cellCount = 0; cellCount < daysArray[rowCount].length; cellCount++)
            {
                var td = document.createElement("td");
                td.innerHTML = daysArray[rowCount][cellCount].date.getDate();                
                
                if (!daysArray[rowCount][cellCount].activeMonth)
                    {td.setAttribute("class", "yvc_inactive_day");}
                else if (daysArray[rowCount][cellCount].weekend)
                    {td.setAttribute("class", "yvc_weekend_day");}
                else    
                    {td.setAttribute("class", "yvc_working_day");}
                
                if (daysArray[rowCount][cellCount].today)
                    {td.style.border = "solid 1px red";}                

                if (daysArray[rowCount][cellCount].activeMonth && 
                        daysArray[rowCount][cellCount].choosedDate)
                    {td.style.backgroundColor = "#DDDDDD";}                    
                               
                td.yvc_id = (daysArray[rowCount][cellCount].activeMonth) 
                    ? "active_day" : "inactive_day"; 
                td.yvc_date = daysArray[rowCount][cellCount].date;
                td.onclick = this.onClick;
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
    },
    
    addFooterView : function(table)
    {
        var tr = document.createElement("tr");
        var td = document.createElement("td");
        td.innerHTML = this.model.getDateStr(this.choosedDate);
        td.yvc_id = "to_select_date";
        td.setAttribute("class", "yvc_footer");
        td.setAttribute("colspan", "7");        
        td.onclick = this.onClick;       
        tr.appendChild(td);
        table.appendChild(tr);        
    }
};

yvCalendar.prototype.model = 
{              
    getDateStr : function(date)
    {
        var months = [
            "января", "февраля", "марта",
            "апреля", "мая", "июня",
            "июля", "августа", "сентября",
            "октября", "ноября", "декабря"];
        
        var day = date.getDate().toString();
        var month = months[date.getMonth()];
        var year = date.getFullYear();
        
        return day + " " + month + " " + year + " г.";
    },
    
    getMonthStr : function(date)
    {
        var yearStr = date.getFullYear().toString();
        var month = date.getMonth() + 1;
        var monthStr = ((month < 10) ? "0" : "") + month.toString();
        return monthStr + "-" + yearStr;
    },
    
    getDaysArray : function(date, choosedDate)
    {
        var today = new Date();
        var month = date.getMonth();        
        var daysArray = new Array();       
        var curDate = new Date(date.getFullYear(), month, 1);
        var weekDayNumber = this.getWeekDayNumber(date.getDay());
        curDate.setDate(curDate.getDate() - (weekDayNumber - 1));       

        for (var rowCounter = 0; rowCounter < 6; rowCounter++)
        {
            daysArray[rowCounter] = new Array();
            
            for (var cellCounter = 0; cellCounter < 7; cellCounter++)
            {            
                var properties = new Object();
                properties.date = new Date(curDate.getFullYear(), 
                    curDate.getMonth(), curDate.getDate());
                properties.activeMonth = (curDate.getMonth() === month);
                properties.weekend = (cellCounter === 5 || cellCounter === 6);
                properties.today = this.compareDates(today, curDate);
                properties.choosedDate = this.compareDates(choosedDate, curDate);
                daysArray[rowCounter][cellCounter] = properties;
                curDate.setDate(curDate.getDate() + 1);
            }
        }
        return daysArray;
    },
    
    compareDates : function(date1, date2)
    {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );        
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
    },    
    
    getWeekDayNumber : function(weekDay)
    {
        return (weekDay > 0) ? weekDay : 7;
    }    
};