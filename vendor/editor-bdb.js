;(function() {
'use strict';
$.fn.forEach = $.fn.forEach || Array.prototype.forEach;

var FolderManager = {
    pack: function( folderID, itemClassName ) {
        var folderObj = {},
            items = $( '#' + folderID ).find( '.' + itemClassName );
        items.forEach( function( item ) {
            var id = item.id;
            folderObj[id] = {
                'title' : $( 'span', item ).first().text(),
                'enabled' : $( 'input', item ).prop( 'checked' ) || false,
                'content' : removeBlankAtLineEnd( $(item).find( 'code' ).text() )
            };
        });
        return folderObj;
    },

    init: function( mainSetting, key ) {
        if ( typeof key !== 'string' ) {
            FolderManager.init( mainSetting, 'userCSSEditor' );
            FolderManager.init( mainSetting, 'userJSEditor' );
            return;
        }

        var userCodeFolder = mainSetting[key];
        if ( !userCodeFolder )
            return;
        removeAllUserItems( key );
        for ( var id in userCodeFolder ) {
            if ( userCodeFolder.hasOwnProperty(id) )
                addUserItem( id, userCodeFolder[id], key );
        }
    }

};

function removeBlankAtLineEnd( text ) {
    return text.replace( /\s+\n/g, '\n' );
}


$( '.user-item-adding > button' ).click( addUserItem );
$( '.user-item-adding > input' ).keydown( function( e ) {
    if ( e.keyCode === 13 )
        addUserItem.call( this );
});

function removeAllUserItems( key ) {
    $( '#' + key ).children().remove();
}

function addUserItem( id, obj, configKey ) {
    var itemsSection, configSection;

    if ( typeof id !== 'string' ) { // from event
        configSection = $( this ).closest( '.config-section' );
        itemsSection = configSection.find( 'section[id]' );
        var titleBox = configSection.find( '.user-item-adding > input' ),
            title = titleBox.val();
        titleBox.val( '' );
        if ( !title ) {
            titleBox.focus();
            return;
        }

        id = itemsSection.data( 'item-prefix' ) + $.now();
        obj = {
            'enabled': true,
            'title': title
        };
    } else {
        itemsSection = $( '#' + configKey ),
        configSection = itemsSection.closest( '.config-section' );
    }

    var itemClassName = itemsSection.data( 'item-class' );
    itemsSection.append( userItem( id, obj, itemClassName ) );
}


/**
 * Share module for User CSS and User Script
 */
function userItem( id, obj, className ) {
    var item = $( '<div data-code-visibility=hidden>' ).addClass( className ).attr( 'id', id );

    var itemChildren = {
        checkbox: $( '<input type=checkbox>' ).prop( 'checked', !!obj.enabled ),
        title: $( '<span contenteditable>' ).text( obj.title ),
        btnGroup: $( '<div class="btn-group">' ),
        pre: $( '<pre class=user-editor>' ).hide()
    }, preChildren = {
        code: $( '<code contenteditable spellcheck="false">' ).text( obj.content || '' )
    }, btnGroupChildren = {
        editButton: $( '<button class="editor-edit-item" data-toggle="button">' ).text( 'edit' ),
        delAskButton: $( '<button class="editor-askdel-item">' ).text( 'delete' ),
        delCancelButton: $( '<button class="editor-canceldel-item btn-success">' ).text( 'cancel' ).hide(),
        delConfirmButton: $( '<button class="editor-confirmdel-item btn-danger">' ).text( 'confirm delete' ).hide()
    };

    var button, elt;
    for ( button in btnGroupChildren )
        btnGroupChildren[button].addClass( 'btn btn-small' ).appendTo( itemChildren.btnGroup );
    for ( elt in preChildren )
        preChildren[elt].appendTo( itemChildren.pre );
    for ( elt in itemChildren )
        itemChildren[elt].appendTo( item );

    $.extend( item, itemChildren );
    $.extend( item.btnGroup, btnGroupChildren );
    $.extend( item.pre, preChildren );

    if ( /css|style/i.test( className ) ) {
        item.pre.code.addClass( 'language-css' );
        item.pre.attr( 'data-lang', 'css');
    } else {
        item.pre.code.addClass( 'language-javascript' );
        item.pre.attr( 'data-lang', 'javascript' );
    }

    $.extend( item, userItem.Methods );
    return item.init();
}

userItem.Methods = {

    init: function() {
        var item = this,
            code = this.pre.code;
        if (window.Prism) {
            // @TODO: hilight it now?
            // Prism.highlightElement( code.get(0) );
            code.blur( function() {
                Prism.highlightElement( this );
            });
        }

        this.btnGroup.on( 'click', '.btn', function( e ) {
            /editor-(\w+)-item/.test( this.className );
            item[RegExp.$1]();
        });

        return this;
    },

    edit: function() {
        this.toggleEditor();
    },

    askdel: function() {
        var btnGroup = this.btnGroup;
        btnGroup.delAskButton.hide();
        btnGroup.delCancelButton.show();
        btnGroup.delConfirmButton.show();
        if ( this.pre.text() )
            this.pre.show();
        else
            this.confirmdel();
    },

    canceldel: function() {
        var btnGroup = this.btnGroup;
        btnGroup.delAskButton.show();
        btnGroup.delCancelButton.hide();
        btnGroup.delConfirmButton.hide();
        if ( this.attr( 'data-code-visibility' ) === 'hidden' )
            this.pre.hide();
    },

    confirmdel: function() {
        this.remove();
    },

    toggleEditor: function() {
        if ( this.attr( 'data-code-visibility' ) === 'hidden' ) {
            this.showEditor();
        } else {
            this.hideEditor();
        }
    },

    showEditor: function() {
        this.pre.show();
        this.attr( 'data-code-visibility', 'visible' );
    },

    hideEditor: function() {
        this.pre.hide();
        this.attr( 'data-code-visibility', 'hidden' );
    }

};


window.FolderManager = FolderManager;

})();
