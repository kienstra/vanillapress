(function() {

'use strict';

Array.prototype.isArray = true;
const _ = require( 'underscore' ),
    h = {

  getAfterHash ( url ) {
    url = url || '';
    let urlSegments = [],
        pageUrl;

    if( url !== '' ) {
      url = url.substring( url.indexOf( '#' ) + 1 );
      urlSegments = url.split( '/' );
    } else {
      pageUrl = window.location.hash.substr( 1 );
      urlSegments = pageUrl.split( '/' );
    }

    return urlSegments;
  },

  addMenuItems ( menuItems, contentType ) {
     _.map( menuItems, ( item ) => {
       let link = h.createLink( item.title, contentType, item.slug );
       h.addMenuItem( link );
     });
  },

  addMenuItem ( menuItem ) {
    let ul = document.querySelector( '#editor nav#secondary ul' ),
        li = document.createElement( 'li' );

    li.appendChild( menuItem );
    ul.appendChild( li );
  },

  createLink ( text, postType, slug ) {
    const linkText = document.createTextNode( text );
    let link = document.createElement( 'a' );


    link.appendChild( linkText );

    if ( postType === 'post' ) {
      link.href = '#blog/' + slug;
    } else if ( postType === 'setting' ) {
      link.href = '#settings/' + slug;
    } else {
      link.href = '#' + slug;
    }

    return link;
  },

  createPostMarkup ( post ) {
    const title = document.createTextNode( post.title );
    let articleEl = document.createElement( 'article' ),
        titleEl = document.createElement( 'h3' ),
        titleLink = document.createElement( 'a' ),
        contentDiv,
        excerpt;

    titleLink.appendChild( title );
    titleLink.href = '#blog/' + post.slug;
    titleEl.appendChild( titleLink );

    contentDiv = document.createElement( 'div' );
    excerpt = post.content;

    if ( excerpt.length > 100 ) {
      excerpt = excerpt.substr( 0, 60 ) + '\u2026';
    }

    contentDiv.innerHTML = excerpt;

    articleEl.appendChild( titleEl );
    articleEl.appendChild( contentDiv );

    return articleEl;
  },

  getEditorEl () {
    return document.getElementById( 'editor' );
  },

  getEditorToggleEl () {
    return document.getElementById( 'editorToggle' );
  },

  getEditorToggleLink () {
    return document.querySelector( '#editorToggle a' );
  },

  getEditorNavs () {
    var editorEl = h.getEditorEl();
    return editorEl.getElementsByTagName( 'nav' );
  },

  getEditorPrimaryNav () {
    return document.querySelector( '#editor nav#primary' );
  },

  getEditorPrimaryNavLinks () {
    return h.getEditorPrimaryNav()
            .getElementsByTagName( 'a' );
  },

  getEditorSecondaryNav () {
    return document.querySelector( '#editor nav#secondary' );
  },

  getEditorSecondaryNavUl () {
    return h.getEditorSecondaryNav()
            .querySelector( 'ul' );
  },

  getEditorAddNewPost () {
    return document.querySelector( '#editor #addNew a' );
  },

  getDeletePostLink () {
    return document.querySelector( '#deletePost a' );
  },

  getCurrentNavEl ( currentMenu ) {
    let nav;

    if ( currentMenu === 'edit' ) {
      nav = h.getEditorEditNav();
    } else if ( currentMenu === 'secondary' ) {
      nav = h.getEditorSecondaryNav();
    } else {
      nav = h.getEditorPrimaryNav();
    }

    return nav;
  },

  getEditorEditNav () {
    return document.querySelector( '#editor nav#edit' );
  },

  getEditorHomeLinkEl ( currentMenu ) {
    return h.getCurrentNavEl( currentMenu )
            .querySelector( 'h3 .go-home' );
  },

  getEditorNavTitleEl ( currentMenu ) {
    return h.getCurrentNavEl( currentMenu )
            .querySelector( 'h3 span' );
  },

  getEditorNavTitleLink () {
    return h.getEditorEditNav()
            .querySelector( 'h3 span a' );
  },

  getEditorTitleField () {
    return document.getElementById( 'editTitle' );
  },

  slugifyTitle ( title ) {
    return title.trim()
                .replace(/[^a-zA-Z0-9\s]/g,"")
                .toLowerCase()
                .replace(/\s/g,'-');
  },

  getEditorWysiwyg () {
    return h.getEditorEditNav()
            .querySelector( 'form iframe' );
  },

  getEditorForm () {
    return h.getEditorEditNav()
            .querySelector( 'form' );
  },

  getEditorEditUpdateBtn () {
    return document.getElementById( 'editUpdateBtn' );
  },

  getSiteName () {
    return document.getElementById( 'siteName' )
                    .querySelector( 'a' );
  },

  getSiteDescription () {
    return document.getElementById( 'siteDesription' );
  },

  getMainNavEl () {
    return document.getElementById( 'mainNav' );
  },

  getMainNavLinks () {
    return document.getElementById( 'mainNav' )
                    .getElementsByTagName( 'a' );
  },

  getPostTitle () {
    return document.getElementById( 'pageTitle' );
  },

  getPrimaryContentEl (){
    return document.querySelector( '#view .content .primary' );
  }

};

module.exports = h;

}());
