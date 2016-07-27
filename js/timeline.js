// Execute JS when DOM est loaded
$(function () {
    //Care to this JS bullshit: months are from 0 to 11

    let tl = new Timeline(365, true, true);
    /* Used to set your own categories
    tl.setCategories([
        {name:'work',color:'yellowgreen', displayOrderInLegend: 1},
        {name:'studies',color:'dodgerblue', displayOrderInLegend: 2},
        {name:'other',color:'orchid', displayOrderInLegend: 3}
    ]);
    */
    tl.addActivities([
         ['left',   'work',      {start:new Date(2016,0,2), end:new Date(2016,5,2)},  {title:'Employee', description:'Somewhere, somehow'}],
         ['left',   'work',      {start:new Date(2015,0,1), end:new Date(2015,10,1)}, {title:'God', description:'in the sky'}],
         ['right',  'work',      {start:new Date(2014,6,1), end:new Date(2015,0,1)},  {title:'New Job on the Right', description:'Awesome layer mate'}],
         ['right',  'studies',   {start:new Date(2015,5,1), end:new Date(2016,0,1)},  {title:'Bachelor Php', description:'Great Studies !'}],
         ['right',  'studies',   {start:new Date(2016,5,1), end:new Date()},          {title:'Bachelor Informatic', description:'Somewhere in Peru'}],
         ['right',  'other',     {start:new Date(2015,1,1), end:new Date(2015,4,1)},  {title:'Python Dev', description:'Somewhere in Switzerland'}]
     ]);
});


class Timeline {

    constructor(defaultPixelByYear = 365, shouldDisplayDate = true, shouldDisplayDescription = true) {
        this.pixelByYear = defaultPixelByYear;
        this.shouldDisplayDescription = shouldDisplayDescription;
        this.shouldDisplayDate = shouldDisplayDate;
        this.defaultCategories = [
            {name: 'work', color: 'yellowgreen', displayOrderInLegend: 1},
            {name: 'studies', color: 'dodgerblue', displayOrderInLegend: 2},
            {name: 'other', color: 'orchid', displayOrderInLegend: 3}];
        this.categories = this.defaultCategories;
        this.categoriesUsed = null;
        this.oldestYear = null;
        this.data = null;
        this.mainline = $('#mainline');
        this.baseDate = new Date(); //baseline is today
        this.createCategoriesCss();

        // createCss base height for a year
        Timeline.createCssClass('.annee', 'height: ' + this.pixelByYear + 'px;font-size: 2em;background: url(\'img/arrow-double.svg\') no-repeat center;background-size: contain;');
    }

    static CONSTANTS() {

        return {
            LOCALE: "en-EN",
            TRANSLATE: {
                YEAR: 'year',
                YEARS: 'years',
                MONTH: 'month',
                MONTHS: 'months',
                TO: 'to'
            }
        };
    }

    getCorrectScale(height) {
        return Math.floor((height/365)*this.pixelByYear);
    }

    setCategories(cat) {
        this.categories = cat;
        this.createCategoriesCss();
    }

    // param createThisCategory[{name, color}] can be used to add a specific category.
    createCategoriesCss(createThisCategory = null) {

        // by default this.defaultCategories will be used
        let cats =
            (createThisCategory !== null) ?
                createThisCategory
                : ((this.categories == null) ? this.defaultCategories : this.categories);

        for (let category of cats) {
            //border top permit a space between collapsed activities
            Timeline.createCssClass('.' + category.name, 'height: inherit; width: 50px; border-top:solid 4px #444;');
            Timeline.createCssClass('.color-' + category.name, 'color: ' + category.color);
            Timeline.createCssClass('.background-' + category.name, 'background-color: ' + category.color);
        }
    }

    static createCssClass(name, rules) {
        var style = document.createElement('style');
        style.type = 'text/css';
        document.getElementsByTagName('head')[0].appendChild(style);
        if (!(style.sheet || {}).insertRule)
            (style.styleSheet || style.sheet).addRule(name, rules);
        else
            style.sheet.insertRule(name + "{" + rules + "}", 0);
    }

    // data = Array of (   [side of timeline, category, {start, end}, {title, description}], etc  )
    addActivities(data) {
        this.data = data;

        //check nb param of datas. Must have 4 param.
        let nbMissingValue = 0;
        for (let element of this.data) {
            if (element.length < 4) nbMissingValue++;
        }

        if (nbMissingValue > 0) {
            console.error('Missing argument for ' + nbMissingValue + ((nbMissingValue === 1)?' activity':' activities') + '. Check your data in your "addActivities call"');
        } else {


            let oldestYearTemp = new Date();
            let categoriesTemp = [];

            for (let element of this.data) {
                //add categorie given to the list of all categories

                categoriesTemp.push(element[1]);
                let dateStart = element[2].start;
                if (dateStart < oldestYearTemp) oldestYearTemp = dateStart;
            }

            //delete doublons
            this.categoriesUsed = Array.from(new Set(categoriesTemp));
            //set oldest year of activity
            this.oldestYear = oldestYearTemp.getFullYear();

            // Build main timeline and "years display" for it
            this.createYearBaseline();

            //Create Timeline elements
            for (let element of this.data) {
                this.createTimelineElement(element[0], element[1], element[2], element[3]);
            }

            this.createLegend();

            //initiate the scroll
            this.scrollInitAnimate();
            //hide timeline blocks which are outside the viewport
            this.scrollHideBlocks(this.timelineBlocks, this.offset);
            //fire scroll event
            this.scrollEvent();
        }
    }

    //add years & arrows on mainline
    createYearBaseline() {

        let counterNbYear = 0;
        let dayUntilPreviousYear = this.dateDiff(new Date(this.baseDate.getFullYear(), 0, 1), this.baseDate);

        let options = {day: "numeric", month: "short"};
        let todayToString = new Date().toLocaleString(Timeline.CONSTANTS().LOCALE, options);

        //create years on mainline
        let newelement = document.createElement('div');
        this.mainline.append($(newelement)
            .css('padding-top', '10px')
            .css('font-size', '2em')
            //.addClass('annee')
            .css('height', dayUntilPreviousYear.height + 'px')
            .html(todayToString));

        /*
         Loop until last year we want
         */
        for (let i = this.baseDate.getFullYear(); i >= this.oldestYear + 1; i--) {
            newelement = document.createElement('div');
            this.mainline.append(
                $(newelement).addClass('annee').html(i)
            );
            counterNbYear++;
        }

        // build max height of the mainline
        //height of current year + height of nb of year wanted
        let maxMainLineSize = dayUntilPreviousYear.height + counterNbYear * $('.annee').css('height');
        this.mainline.attr('height', maxMainLineSize);

    }

    //create all activities on both side lines
    createTimelineElement(line, category, duration, activity) {
        // if a category read is not set, we set it
        if (!this.isCategorySet(category)) {
            //we set a default category as the first of defaultCategories list
            let defaultCategoryColor = '#F0F0F0';
            console.error('Category "' + category + '" not set, color attribued is ' + defaultCategoryColor);
            //then we create css missing
            this.createCategoriesCss([{name: category, color:defaultCategoryColor}]);
        }
        // line can be left or right.
        let lineToUse = (line == 'left') ? $('#leftline') : $('#rightline');

        // use for margin to opposite side
        let invertLine = (line == 'left') ? 'right' : 'left';
        let cssBorderRadius = (line == 'left') ? '10px 0px' : '0px 10px';

        //calculate difference between today and the date filled
        let diffDayBase = this.dateDiff(duration.end, this.baseDate);
        let diffPeriode = this.dateDiff(duration.start, duration.end);

        //create element
        //<div class="activity" style="margin-top: 30px; height: 250px; right:0">
        //        <div class="content" style="margin-right: 10px; text-align: right;">
        //          <h3>Technicien de Labo</h3>
        //          <p>Date à Date</p>
        //          <p>Commentaire, Lieu, Pays</p>
        //        </div>
        //    <div class="work"></div>
        //</div>
        let newactivity = document.createElement('div');
        $(newactivity)
            .addClass('activity')
            .css('margin-top', diffDayBase.height + 'px')
            .css('height', diffPeriode.height + 'px')
            .css(invertLine, '0');
        //TODO, see if adding the height is necessary in case of overflow

        //create element scope
        let newelement = document.createElement('div');
        $(newelement)
            .addClass(category)
            .addClass('background-' + category)
            .css('border-radius', cssBorderRadius);


        //create the content of the activity
        let newcontent = document.createElement('div');
        $(newcontent)
            .addClass('content')
            .css('margin-' + invertLine, '10px')
            .css('text-align', invertLine);

        // Activity Title
        let newContentTitle = document.createElement('h3');
        $(newContentTitle).addClass('content-title color-' + category).html(activity.title + ' | ' + this.datePeriodToString(diffPeriode));


        //Imbricate html elements
        lineToUse.append(newactivity);

        // order is important due to css flex
        if (line == 'left') {
            $(newactivity).append(newcontent);
            $(newactivity).append(newelement);
        } else {
            $(newactivity).append(newelement);
            $(newactivity).append(newcontent);
        }

        $(newcontent).append(newContentTitle);

        // Add facultative content :
        // Activity Date
        if (this.shouldDisplayDate) {
            // Activity Date
            let options = {year: "numeric", month: "long"};
            let debut = duration.start.toLocaleString(Timeline.CONSTANTS().LOCALE, options);
            let fin = duration.end.toLocaleString(Timeline.CONSTANTS().LOCALE, options);
            let newContentDate = document.createElement('p');
            $(newContentDate).addClass('content-date').html(debut + ' '+ Timeline.CONSTANTS().TRANSLATE.TO +' ' + fin);
            $(newcontent).append(newContentDate);
        }



        // Activity Description
        if (this.shouldDisplayDescription) {
            let newContentDescription = document.createElement('p');
            $(newContentDescription).addClass('content-description').html(activity.description);
            $(newcontent).append(newContentDescription);
        }

    }

    //check if categorie exist in current categories list used
    isCategorySet(categoryName) {
        return this.categories.find(function(currentCat) {
            return currentCat.name === categoryName;
        })
    }
    //create legend of categories
    createLegend() {

        //create bloc legend
        let legend = document.createElement('div');
        $('#timeline').append(
            $(legend)
                .addClass('legend')
            //set height of legend
            //.prop('height', this.categories.length * 20 + 'px')
        );

        //create order tab for legend
        let categoriesOrdered = [];

        //associate order at each category name used
        this.categoriesUsed.forEach(function(category) {

            let displayOrderLegend = this.categories.find(function(currentCat) {
                return currentCat.name === category;
            }).displayOrderInLegend;

            categoriesOrdered.push({displayOrder:displayOrderLegend,name:category});

        }, this);

        //order categories
        categoriesOrdered.sort(function(a, b) {
            //we want ascending order
            return (a.displayOrder > b.displayOrder);
        });

        //create legend of categories
        let cat;
        for (let category of categoriesOrdered) {
            cat = document.createElement('p');
            $(legend).append(
                $(cat)
                    .addClass('background-' + category.name)
                    .html(category.name)
            );
        }
    }

    dateDiff(date1, date2) {

        // Initialisation du retour
        let diff = {};
        let tmp = date2 - date1;

        // Seconds between 2 dates
        tmp = Math.floor(tmp / 1000);
        diff.sec = tmp % 60; // Extract seconds

        // Minutes (integer)
        tmp = Math.floor((tmp - diff.sec) / 60);
        diff.min = tmp % 60; //Extract Minutes

        // Hours (integer)
        tmp = Math.floor((tmp - diff.min) / 60);
        diff.hour = tmp % 24; // Exract Hours

        // Days remaning
        tmp = Math.floor((tmp - diff.hour) / 24);
        diff.day = tmp;

        // Months remaining
        tmp = Math.floor(tmp / 30);
        diff.month = tmp % 12;

        // Years remaining
        tmp = Math.floor((diff.day) / 365);
        diff.year = tmp;

        //Height wanted for date, determinated by constructor properties
        diff.height = this.getCorrectScale(diff.day);

        return diff;
    }

    //return period format into string as "x years y months"
    datePeriodToString(datePeriod) {
        let delay = '';

        //special case for long time
        if (datePeriod.year > 2 && datePeriod.month >= 6) {
            delay += (datePeriod.year + 1 ) + ' ans ';
        }
        else if (datePeriod.year == 1 && datePeriod.month >= 6) {
            delay += (datePeriod.year + 1 ) + ' ans ';
        }
        else {

            //add years if sup to 0
            if (datePeriod.year > 0) {
                delay += (datePeriod.year == 1) ? '1 ' + Timeline.CONSTANTS().TRANSLATE.YEAR + ' ' : datePeriod.year + ' ' + Timeline.CONSTANTS().TRANSLATE.YEARS + ' ';
            }

            console.info(this.translate);
            //add months if sup to 0
            if (datePeriod.month > 0) {
                delay += (datePeriod.month == 1) ? '1 ' + Timeline.CONSTANTS().TRANSLATE.MONTH + ' ' : datePeriod.month + ' ' + Timeline.CONSTANTS().TRANSLATE.MONTHS + ' ';
            }
        }

        return delay;
    }


    // Manage display of activities while scrolling
    scrollInitAnimate() {
        //elements would apply effect on
        this.timelineBlocks = $('.activity');
        this.offset = 0.85;
    }

    scrollEvent () {

        let scrollEvent = {
            handleEvent: function () {
                (!window.requestAnimationFrame)
                    // $.proxy to give current context to the function
                    ? setTimeout($.proxy(function () {
                    this.currentTimeline.scrollShowBlocks(this.currentTimeline.timelineBlocks, this.currentTimeline.offset);
                }, 100), this.currentTimeline)
                    : window.requestAnimationFrame($.proxy(function () {
                    this.scrollShowBlocks(this.timelineBlocks, this.offset);
                }, this.currentTimeline));
            },
            currentTimeline: this
        };

        //on scolling, show/animate timeline blocks when enter the viewport
       window.addEventListener("scroll", scrollEvent, false);
    }

    scrollHideBlocks(blocks, offset) {
        blocks.each(function () {
            //hide only blocks not visible on current view
            if ($(this).offset().top > $(window).scrollTop() + $(window).height() * offset) {
                $(this).addClass('is-hidden');
            }
        });
    }

    scrollShowBlocks(blocks, offset) {
        blocks.each(function () {
            if ($(this).hasClass('is-hidden') && ($(this).offset().top <= $(window).scrollTop() + $(window).height() * offset)) {
                $(this).removeClass('is-hidden').addClass('animate');
            }
        });
    }


}

