/**
 * Contains the properties and methods for the editor.
 *
 * @exports editor
 */

var Spinner = require( 'spin.js' ),
    helpers = require( './lib/helpers.js' ),
    router = require( './router.js' ),
    model = require( './model.js' ),
    view = require( './view.js' ),
    wysiwygEditor = require('wysiwyg'),
    wysiwyg;

/**
 * Main editor panel.
 *
 * @namespace
 */
var editor = {
  init: function() {
    editor.listenEditorToggle();
  },

  visible: 'false',
  currentMenu: 'edit',
  currentPost: '',
  currentPostType: '',


  /**
   * Listener for Admin link in editor.
   * Clears menus and shows primary menu.
   *
   */
  listenAdminHomeLink: function(){
    editor.clearMenus();
    editor.showPrimaryMenu();
    event.preventDefault();
  },


  /**
   * Listeners for links in the primary menu
   * Loads seconday menu
   *
   */
  listenPrimaryLinks: function() {
    var urlSegments = helpers.getAfterHash( this.href );
    editor.currentPostType = urlSegments[0];
    editor.clearMenus();
    editor.showSecondaryMenu();
    event.preventDefault();
  },


  /**
   * Listener for post type link in editor
   * (i.e. Posts, Pages, Settings).
   * Loads secondary menu.
   *
   */
  listenSecondaryNavTitle: function(){
    editor.clearMenus();
    editor.showSecondaryMenu();
    event.preventDefault();
  },


  /**
   * Listener to load the post edit field.
   *
  */
  listenLoadEditForm: function(){
    editor.clearMenus();
    var slugs = helpers.getAfterHash( this.href ),
        post = model.getPostBySlugs( slugs );

    editor.currentPost = post;
    editor.currentPostType = post.type;

    if ( editor.currentPostType !== 'settings' ) {
      view.currentPost = post;
      view.update();
    } else {
      event.preventDefault();
    }

    editor.showEditPanel();
  },


  /**
   * Listener to the new post field
   *
   */
  listenLoadNewPostForm: function(){
    var post = {slug: '_new',title:'',content:''},
        updateBtn = helpers.getEditorEditUpdateBtn(),
        deleteBtn = helpers.getDeletePostLink();

    event.preventDefault();
    editor.clearMenus();
    editor.currentPost = post;

    if ( editor.currentPostType !== 'settings' ) {
      // Clear the view
      view.clearContent();
    }

    editor.showEditPanel();
    deleteBtn.classList.add( 'hidden' );
    updateBtn.innerText = 'Save';
  },


  /**
   * Listener for the editor toggle button
   *
   */
  listenEditorToggle: function(){
    var editorToggleEl = helpers.getEditorToggleLink();
    editorToggleEl.addEventListener( 'click', function(){
      editor.toggle();
      event.preventDefault();
    }, false );
  },


  /**
   * Listener to update content from the post add / edit
   * form.
   *
   * @todo Make sure url slug is unique
   */
  listenUpdatePost: function() {
    var newPost = false,
        postType = editor.currentPostType,
        store = model.getLocalStore(),
        localStore = model.getLocalStore(),
        storePosts;

    event.preventDefault();

    // If new post add to local store
    if( editor.currentPost.slug === '_new' ) {
      var postIds = [],
          highestId;

      newPost = true;
      editor.currentPost.type = 'posts';

      // Slugify title
      editor.currentPost.slug = helpers.slugifyTitle( editor.currentPost.title );
      // Make sure slug is unique
      editor.currentPost.slug = model.uniqueifySlug( editor.currentPost.slug );

      // Get a new post id
      editor.currentPost.id = model.getNewPostId();

      // Set the date
      editor.currentPost.date = Date();
      editor.currentPost.modified = Date();
    }

    // Get temp store of posts based on type
    if ( postType === 'posts' ) {
      storePosts = store.posts;
    } else if ( postType === 'pages' ) {
      storePosts = store.pages;
    } else {
      storePosts = store.settings;
    }

    // Get the current item to edit from store.
    if ( newPost === true ) {
      storePosts.push( editor.currentPost );
    } else {
      storePosts.forEach(function( item ){
        if( editor.currentPost.id == item.id ){
          item.title = editor.currentPost.title;
          item.content = editor.currentPost.content;
          item.modified = Date();
        }
      });
    }

    // Add temp store data back
    if ( postType === 'posts' ) {
      store.posts = storePosts;
    } else if ( postType === 'pages' ) {
      store.pages = storePosts;
    } else {
      store.settings = storePosts;
    }
    model.updateLocalStore( store );

    // Update url and current post
    if ( postType === 'posts' ) {
      router.updateHash( 'blog/' + editor.currentPost.slug );
    } else if ( postType === 'pages' ) {
      router.updateHash( editor.currentPost.slug );
    } else {

    }

    view.update();
    editor.updateSaveBtnText();
  },


  /**
   * Listener to delete post
   *
   */
  listenDeletePost: function(){
    var store = model.getLocalStore(),
        storePosts = store.posts,
        confirmation = confirm('Are you sure you want to delete this post?'),
        deleteId,
        deleteIdIndex;

    // Get the index of the item to delete from store
    for ( var i = 0, max = storePosts.length; i < max ; i++) {
      if ( editor.currentPost.id === storePosts[i].id ) {
        deleteIdIndex = i;
      }
    }

    // Only procude with delete if confirmation
    if ( confirmation === true ) {
      // Remove item from store
      storePosts.splice( deleteIdIndex, 1 );
      store.posts = storePosts;
      model.updateLocalStore( store );

      // Update current post to empty, show blog posts
      editor.currentPost = {};
      view.currentPost = model.getPostBySlug( 'blog', 'pages' );
      view.update();
      editor.clearMenus();
      editor.showSecondaryMenu();
    }

    event.preventDefault();
  },


  /**
   * Displays the primary menu.
   *
   */
  showPrimaryMenu: function(){
    var primaryNav = helpers.getEditorPrimaryNav(),
        primaryLinks = helpers.getEditorPrimaryNavLinks();

    primaryNav.classList.add( 'active' );

    // Add event listeners to primary links
    for ( var i = 0, max = primaryLinks.length; i < max; i++ ) {
      primaryLinks[i].addEventListener(
        'click',
        editor.listenPrimaryLinks,
        false
      );
    }
    editor.currentMenu = 'primary';
  },

  /**
   * Displays the secondary menu
   *
   */
  showSecondaryMenu: function(){
    var secondaryNav = helpers.getEditorSecondaryNav(),
        postType = editor.currentPostType,
        menuItems = model.getPostsByType( postType ),
        secondaryUl =  helpers.getEditorSecondaryNavUl(),
        secondaryLinks = secondaryUl.getElementsByTagName( 'a' ),
        addNewPostLink = helpers.getEditorAddNewPost(),
        deletePostLink = helpers.getDeletePostLink();

    // Display secondary menu
    secondaryNav.classList.add( 'active' );
    editor.currentMenu = 'secondary';
    editor.updateNavTitle();
    helpers.addMenuItems( menuItems, postType );

    // Add listeners to secondary links
    for ( var i = 0, max = secondaryLinks.length; i < max; i++ ) {
      secondaryLinks[i].addEventListener(
        'click',
        editor.listenLoadEditForm,
        false);
    }

    // Check if need to show new post button
    if ( editor.currentPostType === 'posts' ) {
      addNewPostLink.classList.remove('hidden');
      // Add listener to new post link
      addNewPostLink.addEventListener(
        'click',
        editor.listenLoadNewPostForm,
        false
      );
    } else {
      addNewPostLink.classList.add('hidden');
    }

  },

  /**
   * Displays the edit post panel
   *
   */
  showEditPanel: function() {
    var post = editor.currentPost,
        editNav = helpers.getEditorEditNav(),
        editForm = helpers.getEditorForm(),
        titleField = helpers.getEditorTitleField();
        deleteBtn = helpers.getDeletePostLink();

    // Display the edit panel and form
    editor.clearEditForm();
    editNav.classList.toggle('active');
    editor.currentMenu = 'edit';
    editor.updateNavTitle();
    editor.fillEditForm();

    // Add event listener to update post
    editForm.addEventListener(
      'submit',
      editor.listenUpdatePost,
      false
    );

    titleField.removeAttribute( 'readonly', 'readonly' );

    if ( editor.currentPostType === 'posts' ) {
      deleteBtn.classList.remove( 'hidden' );
      // Add event listener to delete post
      deleteBtn.addEventListener(
        'click',
        editor.listenDeletePost,
        false
      );
    } else if ( editor.currentPostType === 'settings' ) {
      // Make title input read only
      titleField.setAttribute( 'readonly', 'readonly' );
      deleteBtn.classList.add( 'hidden' );
    } else {
      deleteBtn.classList.add( 'hidden' );
    }
  },

  /**
   * Dynamically fill the edit post form based on the
   * current post.
   *
   */
  fillEditForm: function() {
    var post = editor.currentPost,
        editTitle = document.getElementById('editTitle'),
        postTitle = helpers.getPostTitle(),
        titleField = helpers.getEditorTitleField();

    // Update the title and content fields
    editTitle.value = post.title;
    editContent.value = post.content;

    // Initialize the wysiwyg editor
    wysiwyg = wysiwygEditor(document.getElementById('editContent'));

    //  Add listeners to update the view on field changes
    if ( post.type !== 'settings' ) {
      // Actions if not editing a setting
      titleField.addEventListener( 'input', function() {
        editor.currentPost.title = this.value;
        view.updateTitle( this.value );
      }, false);
      wysiwyg.onUpdate( function() {
        view.updateContent( wysiwyg.read() );
        editor.currentPost.content = wysiwyg.read();
      });
    } else if (  post.slug === 'site-name' ) {
    // Live update controls for settings
      wysiwyg.onUpdate(function () {
        view.updateSiteName( wysiwyg.read() );
        editor.currentPost.content = wysiwyg.read();
      });
    } else if( post.slug == 'site-description' ) {
      wysiwyg.onUpdate( function () {
        view.updateSiteDescription( wysiwyg.read() );
        editor.currentPost.content = wysiwyg.read();
      });
    }
  },

  /**
   * Clears the edit form.
   * Must call before loading data to form.
   *
   */
  clearEditForm: function() {
    var editTitle = document.getElementById( 'editTitle' ),
        wysiwyg = helpers.getEditorWysiwyg();

    // Set the edit fields blank
    editTitle.value = '';
    editContent.value = '';
    // Remove the wysiwyg editor
    if ( wysiwyg !== null ) {
      wysiwyg.remove();
    }
  },

  /**
   * Clears the current menu.
   * Must call before loading a menu.
   *
   */
  clearMenus: function(){
    var navs = helpers.getEditorNavs(),
        navUl = helpers.getEditorSecondaryNavUl(),
        navlinks = navUl.getElementsByTagName( 'a' );

    // Remove active class from all navs
    for ( var j = 0, max = navs.length; j < max; j++ ) {
      var nav = navs[j];
      nav.classList.remove( 'active' );
    }

    // Remove event listeners from all previous nav links
    for ( var i = 0, navMax = navlinks.length; i < navMax; i++ ) {
      navlinks[i].removeEventListener(
        'click',
        editor.refreshMenu,
        false
      );
    }

    // Remove all list items from secondary nav ul tag
    while ( navUl.firstChild ) {
      navUl.removeChild( navUl.firstChild );
    }

  },


  /**
   * Main control for the editor toggle.
   *
   */
  toggle: function() {
    var editorEl = helpers.getEditorEl(),
        toggleEl = helpers.getEditorToggleEl(),
        viewEl = helpers.getViewEl();

    // Clear menus and load edit panel
    editor.clearMenus();
    editor.currentPost = view.currentPost;
    editor.currentPostType = view.currentPost.type;
    editor.currentMenu = 'edit';

    // Toggle editor and nav hidden classes
    editorEl.classList.toggle('hidden');
    toggleEl.classList.toggle('hidden');
    // Toggle whether view nav is disabled
    viewEl.classList.toggle('inactive');

    // Take specific actions if opening or closing editor
    if ( toggleEl.classList.contains( 'hidden' ) === false ) {
      // If opening editor
      var navTitleLink = helpers.getEditorNavTitleLink();
      editor.showEditPanel();
      navTitleLink.addEventListener(
        'click',
        editor.listenSecondaryNavTitle,
        false
      );
      view.listenDisableViewLinks();
    } else {
      // If closing editor
      if ( view.currentPost.type === 'posts' ) {
        router.updateHash( 'blog/' + view.currentPost.slug );
      } else {
        if ( editor.currentPost.slug === '_new' ) {
          // If closing a new post editor
          router.updateHash( 'blog' );
          router.setCurrentPost();
        } else {
          router.updateHash( view.currentPost.slug );
        }
      }
      view.listenEnableViewLinks();
    }

  },

  /**
   * Update the editor breadcrumb navigation
   * (i.e. Admin / Posts, Admin / Pages, Admin / Settings, etc. )
   *
   */
  updateNavTitle: function() {
    var postType = editor.currentPostType,
        currentMenu = editor.currentMenu,
        homeLink = helpers.getEditorHomeLinkEl( currentMenu );

    // Add event listener to Admin home link
    homeLink.addEventListener(
      'click',
      editor.listenAdminHomeLink,
      false
    );

    // Add secondary link based on current nav and post type
    if( currentMenu === 'secondary' ) {
      // If on secondary nav
      var navTitleEl = helpers.getEditorNavTitleEl( currentMenu );
      navTitleEl.innerHTML = postType;
    } else {
      // If editing post
      var navTitleLink = helpers.getEditorNavTitleLink();
      navTitleLink.textContent = postType;
      navTitleLink.addEventListener(
        'click',
        editor.listenSecondaryNavTitle,
        false
      );
    }

  },

  /**
   * Saves post in edit form.
   * Mimics live updating text: "Saving, Saved!"
   *
   */
  updateSaveBtnText: function() {
    var btn = helpers.getEditorEditUpdateBtn(),
        finalText = 'Udpate',
        savedText = 'Saved!',
        spinnerOpts = {
          color:'#fff',
          lines: 8,
          length: 4,
          radius: 3,
          width: 1,
          left: '10%'
        },
        spinner = new Spinner( spinnerOpts )
                        .spin( btn ),
        // Displays save text
        saving = function() {
          setTimeout( function () {
            spinner.stop();
            btn.innerText = savedText;
            saved();
          }, 900 );
        },
        // Displays final text
        saved = function(){
          setTimeout( function () {
            btn.innerText = finalText;
          }, 1000 );
        };

    // Update btn text and start saving
    btn.innerText = 'Saving...';
    saving();
  }
};

module.exports = editor;
