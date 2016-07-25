# README #

------------
>Vertical timeline with 2 sides.

I was looking for a vertical timeline mainly for creating my resume online. It appears doesn't really exists like I would. Thus was born this project.
I share it as a version 1.0. Feel free to improve with PR.

**JS in ECMA6**  
See class 
```
Timeline(defaultPixelByYear = 365, shouldDisplayDate = true, shouldDisplayDescription = true);
```

**What it does**

Vertical timeline with a mainline containing years. On each side of it, you place your data.
The top of mainline is TODAY. The bottom is the oldest date you created in your activities.
You can create your own categories, choose their associate colour and the order you want to display its in the legend.

**Concrete use**
```
let tl = new Timeline(365, true, true);
tl.addActivities([
         ['left',   'work',      {start:new Date(2016,0,2), end:new Date(2016,5,2)},  {title:'Something', description:'Somewhere, somehow'}],
         ['right',  'studies',   {start:new Date(2016,5,1), end:new Date()},          {title:'Bachelor Informatic', description:'Somewhere in Peru'}],
         ['right',  'other',     {start:new Date(2015,1,1), end:new Date(2015,4,1)},  {title:'Python Dev', description:'Somewhere in Switzerland'}]
     ]);
```

That's the minimum.
In addition, you can set your own categories before adding activities with :
```
tl.setCategories([
        {name:'work',color:'yellowgreen', displayOrderInLegend: 1},
        {name:'studies',color:'dodgerblue', displayOrderInLegend: 2},
        {name:'other',color:'orchid', displayOrderInLegend: 3}
    ]);
```

By default, 3 categories are created : *work*, *studies* and *other*.


**TODO**
- Dynamic date locale (parameter of `date.toLocaleString` is currently harcoded 'en-EN')
- ...

### Who manage this project ? ###
* Keiro