// Execute JS when DOM est loaded
$(function () {

    //Care to this JS trick : months are from 0 to 11
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
