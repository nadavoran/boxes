## My Notes

As part of working on this task I've made some assumptions and choose some directions just because I didn't have all the information I needed, usually I'll collaborate with the Product\UX or understand the needs more in order to get best result and the expected behavior

-   Boxes are border only to see all the boxes(easy to change to fill)
-   Using the sessionStorage for refresh consistency, could use the indexedDB (probably using Dexie.js)
-   There are 2 versions for the left panel (the normal and shrink), normally I'll create a nicer animation when switching the 2 options, but that will require more time and I'm not even sure it's needed
-   There is no state state management in the solution as I din't see the need for one.
-   There is a minimum use of third parties, only added FontAwesome for nicer icons
-   Communications between component is based on props
-   Tested only on Chrome
-   There are many small things to upgrade but I think that could wait after getting fisrt feedback
-   For more readable css I would use Sass, but when I started I didn't think I'll go with a complex css
