<!-- TOC -->
* [Cinemateca](#cinemateca)
  * [Members of the Group](#members-of-the-group)
  * [Links](#links)
  * [Functionality](#functionality)
    * [Entites](#entites)
      * [Movies](#movies)
      * [Person](#person)
    * [Search](#search)
    * [Filtering](#filtering)
  * [Wireframes](#wireframes)
    * [Wide Screen Views](#wide-screen-views)
    * [Mobile Views](#mobile-views)
* [Práctica 1](#práctica-1)
  * [Screenshots](#screenshots)
  * [Participation](#participation)
    * [Alejandro](#alejandro)
    * [Farina](#farina)
    * [Felix](#felix)
* [Práctica 2](#práctica-2)
  * [Screenshots](#screenshots-1)
  * [Participation](#participation-1)
    * [Alejandro](#alejandro-1)
    * [Farina](#farina-1)
    * [Felix](#felix-1)
* [Práctica 3](#práctica-3)
  * [Screenshots](#screenshots-2)
  * [Participation](#participation-2)
    * [Alejandro](#alejandro-2)
    * [Farina](#farina-2)
    * [Felix](#felix-2)
<!-- TOC -->

# Cinemateca
Cinemateca is a web application that serves as a comprehensive movie catalog, allowing users to browse and search a vast database of films.

## Members of the Group
* Alejandro Guzmán Sánchez (E-Mail: a.guzmans.2025@urjc.es, GitHub: [AlejandroGS47](https://github.com/AlejandroGS47))
* Farina Schlegel (E-Mail: f.schlegel.2025@alumnos.urjc.es, GitHub: [frinnana](https://github.com/frinnana))
* Felix Schwabe (E-Mail: f.schwabe.2025@alumnos.urjc.es, GitHub: [7dns](https://github.com/7dns))

## Links
[Link to Trello](https://trello.com/invite/b/68d0f24f8deb98189ef954eb/ATTI17034f224bc8ee2a098984e95cb7a264E5C95465/cinemateca)

## Functionality
### Entites
![image](uml/uml_entities_v02.png "UML diagram")

#### Movies
`Movie` is the primary entity of the web application. Each `Movie` contains essential information and is linked to its actors. Each `Movie` has at least one actor.

A `Movie` has:
* unique ID,
* title,
* poster (image file),
* short description,
* genre,
* release year,
* country of production,
* age rating,
* one or more actors

#### Person
The secondary entity in the application is `Person`. A `Person` is someone who acts in a `Movie`. *(Optional: A `Person` may also represent any individual involved in at least one `Movie`, such as an actor, director or writer. Every `Person` must be linked to at least one movie.)*

A `Person` has:
* unique ID,
* name
* portrait (image file),
* date of birth,
* place of birth,
* short description

### Search
The application will include a search function that allows users to find movies by their title. *(Optional: Users may also enter the name of a person (e.g. actor, director or writer) involved in the movie.)*

### Filtering
The application will include a function to filter search results (e.g. by genre, release year or country of production).

## Wireframes
The following wireframes show the planned layout of Cinemateca, giving a visual overview of the application’s structure and functionality.

### Wide Screen Views
![image](wireframes/screenWide_startView.png "Start View")
![image](wireframes/screenWide_movieView.png "Detail View of a selected Movie")
![image](wireframes/screenWide_personView.png "Detail View of a selected Person")

### Mobile Views
![image](wireframes/mobile_allViews.png "Start View and Detail View of a selected Movie and Person in Mobile View")

# Práctica 1

## Screenshots
![image](documentation/practica-1_screenshot-1.png)
![image](documentation/practica-1_screenshot-2.png)
![image](documentation/practica-1_screenshot-3.png)

## Participation

### Alejandro
**Description of the Tasks Completed:**
By the time I joined the team, the initial idea of the project had already been developed by Farina and Felix, so a lot of progress had already been done, specially the main functionalities for the app. Having this in mind, I focused entirely on improving some elements to make it more visually attractive. One of my main tasks was changing our movie catalog grid layout from CSS to Bootstrap, which now has the posibility to adapt to the different screen widths, decreasing the amount of columns when the screen is narrow, making it only one column for mobile devices and three columns for wider screens. Also, using CSS, I developed a hover effect for the movie posters to show each movie's name and year of production when the cursor is placed over the poster using a smooth transition. My third contrbution to the project so far was making the text size in the "Movie details" increase or decrease depending on the screen width so the text doesn't jump so many lines and gets unaligned with the movie poster and the rest of the content. Finally, I added the favicon for all HTML pages through the website. 

**Five Most Significant Commits**
- ...
- ...

**Five Most Contributed Files**
- ...
- ...

### Farina
**Description of the Tasks Completed:**
At the beginning of the project, I worked together with Felix to develop the initial concept for our web application. We documented our ideas in the README file and created the first wireframes. Later, I focused mainly on the visual aspects of the web app. I contributed to the CSS styling and helped ensure that the overall design remained visually consistent across all pages. During this phase, I also familiarized myself with the Bootstrap framework and used it to improve the structure of certain layouts. I integrated the Bootstrap Icons library and added icons to all buttons across the application to create a more intuitive and uniform interface. In addition, I was mainly responsible for styling the 'addNewMovie.html', making sure it aligned with the overall look and feel of the project.

**Five Most Significant Commits**
- [9f57e80](https://github.com/CodeURJC-FW-2025-26/webapp04/commit/9f57e80eee313b6c282380eb65b843b5cbaa9b15): Replaced text-based buttons with Bootstrap icons across multiple pages to create a cleaner and more consistent interface.
- [f9b51c7](https://github.com/CodeURJC-FW-2025-26/webapp04/commit/f9b51c73dc61aca82cbbc9ac525f04cd587bc406): Added missing icons to buttons on addNewMovie.html and personDetails.html to ensure consistent visual design across pages.
- [e83fe7b](https://github.com/CodeURJC-FW-2025-26/webapp04/commit/e83fe7ba1104e15f8e2f75252bc4f6473b4dc642): Updated the README file and wireframes together with Felix to document the initial project idea and design concept.
- [f4f0968](https://github.com/CodeURJC-FW-2025-26/webapp04/commit/f4f0968f37aa774c384106ea363f1be151b9e4f2): Styled addNewMovie.html and refined addNewMovie.css to define the overall layout and color scheme for the page.
- [1869d91](https://github.com/CodeURJC-FW-2025-26/webapp04/commit/1869d91ccf7b724d6b6e58754b5bee4b272e0880): Improved hover behavior and interaction logic between icons and buttons in general.css to ensure consistent visual feedback.


**Five Most Contributed Files**
- [`general.css`](https://github.com/CodeURJC-FW-2025-26/webapp04/blob/main/styles/general.css)
- [`addNewMovie.css`](https://github.com/CodeURJC-FW-2025-26/webapp04/blob/main/styles/addNewMovie.css)
- [`variables.css`](https://github.com/CodeURJC-FW-2025-26/webapp04/blob/main/styles/variables.css)
- [`README.md`](https://github.com/CodeURJC-FW-2025-26/webapp04/README.md) documented project ideas together with Felix
- Felix and I worked together on the wireframes while developing the project idea



### Felix
**Description of the Tasks Completed:**
Before Alejandro joined the group, Farina and I developed the initial idea for our project and created the wireframes along with the UML class diagram.
I implemented the first version of all four HTML pages and their corresponding CSS files. Early on, I continuously refined the CSS to eliminate redundancies and ensure a consistent design across all pages. To achieve this, I created separate CSS files to store shared variables and common styles. I also made sure that the header and footer were consistent on every page.
When Bootstrap was introduced in class, I refactored some of the existing CSS grids to use Bootstrap’s grid system instead.
I added hover effects to the buttons for the secondary entities (the actors) in `movieDetails.html` to allow editing and deleting them.
Finally, I verified that all pages were fully responsive and made some last adjustments.

**Five Most Significant Commits**
- [d3f02d5](https://github.com/CodeURJC-FW-2025-26/webapp04/commit/d3f02d5a08640904ea29045cf7774de73a87f1dc): Documented the initial project ideas in the README file (together with Farina).
- [324bd1a](https://github.com/CodeURJC-FW-2025-26/webapp04/commit/324bd1ab063eac974a9d8dfe2eb4b577bbc490b7): Realized the first wireframes as HTML pages (`index.html`, `movieDetails.html`, and `personDetails.html`) with CSS. 
- [4b83b8a](https://github.com/CodeURJC-FW-2025-26/webapp04/commit/4b83b8ad5ee8b023b5ce10b58884bf99b2cd9275): Built an initial prototype of the “Add New Primary Entity” feature (`addNewMovie.html`) with CSS. 
- [e4f6304](https://github.com/CodeURJC-FW-2025-26/webapp04/commit/e4f6304aaaeb0ac3b578ed944d5c7bad36b21625): Refactored the CSS structure to include common styles in a shared CSS file and defined reusable values in a separate file for future reuse. 
- [9a4f26f](https://github.com/CodeURJC-FW-2025-26/webapp04/commit/9a4f26f1b65f8a8b885e1db86843ddfd50a25a27): Improved the responsiveness of `movieDetails.html`, particularly the hover effect in the actors list, and `personDetails.html`.

**Five Most Contributed Files**
- [`movieDetails.html`](https://github.com/CodeURJC-FW-2025-26/webapp04/blob/main/pages/movieDetails.html)
- [`personDetails.html`](https://github.com/CodeURJC-FW-2025-26/webapp04/blob/main/pages/personDetails.html)
- [`variables.css`](https://github.com/CodeURJC-FW-2025-26/webapp04/blob/main/styles/variables.css)
- [`pageLayout.html`](https://github.com/CodeURJC-FW-2025-26/webapp04/blob/main/styles/pageLayout.css)
- all images files used for [movie posters](https://github.com/CodeURJC-FW-2025-26/webapp04/tree/main/images/moviePosters) and [actor portraits](https://github.com/CodeURJC-FW-2025-26/webapp04/tree/main/images/persons)

# Práctica 2

## Screenshots

## Participation

### Alejandro
**Description of the Tasks Completed:**
...

**Five Most Significant Commits**
- ...
- ...

**Five Most Contributed Files**
- ...
- ...

### Farina
**Description of the Tasks Completed:**
...

**Five Most Significant Commits**
- ...
- ...

**Five Most Contributed Files**
- ...
- ...

### Felix
**Description of the Tasks Completed:**
...

**Five Most Significant Commits**
- ...
- ...

**Five Most Contributed Files**
- ...
- ...

# Práctica 3

## Screenshots

## Participation

### Alejandro
**Description of the Tasks Completed:**
...

**Five Most Significant Commits**
- ...
- ...

**Five Most Contributed Files**
- ...
- ...

### Farina
**Description of the Tasks Completed:**
...

**Five Most Significant Commits**
- ...
- ...

**Five Most Contributed Files**
- ...
- ...

### Felix
**Description of the Tasks Completed:**
...

**Five Most Significant Commits**
- ...
- ...

**Five Most Contributed Files**
- ...
- ...
