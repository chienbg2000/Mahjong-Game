/*!
 *  電脳麻将 v2.5.0
 *
 *  Copyright(C) 2017 Satoshi Kobayashi
 *  Released under the MIT license
 *  https://github.com/kobalab/Majiang/blob/master/LICENSE
 */
"use strict";

const { hide, show, fadeIn, scale,
        setSelector, clearSelector  } = Majiang.UI.Util;

let loaded;

$(function(){

    let game;
    const pai   = Majiang.UI.pai($('#loaddata'));
    const audio = Majiang.UI.audio($('#loaddata'));

    const analyzer = (kaiju)=>{
        $('body').addClass('analyzer');
        return new Majiang.UI.Analyzer($('#board > .analyzer'), kaiju, pai,
                                        ()=>$('body').removeClass('analyzer'));
    };
    const viewer = (paipu)=>{
        $('#board .controller').addClass('paipu')
        $('body').attr('class','board');
        scale($('#board'), $('#space'));
        const _viewer
                = new Majiang.UI.Paipu(
                        $('#board'), paipu, pai, audio, 'Majiang.pref',
                        ()=>fadeIn($('body').attr('class','file')),
                        analyzer);
        delete _viewer._view.dummy_name;
        return _viewer;
    };
    const stat = (paipu_list)=>{
        fadeIn($('body').attr('class','stat'));
        return new Majiang.UI.PaipuStat($('#stat'), paipu_list,
                        ()=>fadeIn($('body').attr('class','file')));
    };
    const file = new Majiang.UI.PaipuFile($('#file'), 'Majiang.game',
                                            viewer, stat);
    let rule = Majiang.rule(
                    JSON.parse(localStorage.getItem('Majiang.rule')||'{}'));

    function applyBoardTransformScale() {
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        const $boardRoot = $('#board');
        if (viewportWidth && viewportWidth < 800) {
            const s = viewportWidth / 800;
            $boardRoot.css('transform-origin', '0% 0%')
                      .css('transform', `scale(${s})`);
            $('#board > .board').css('transform', 'none');
            $('#board > .controller').css('transform', 'none');
        }
        else {
            $boardRoot.css('transform', '');
        }
    }

    function start() {
        let players = [ new Majiang.UI.Player($('#board'), pai, audio) ];
        for (let i = 1; i < 4; i++) {
            players[i] = new Majiang.AI();
        }
        game = new Majiang.Game(players, end, rule);
        game.view = new Majiang.UI.Board($('#board .board'),
                                        pai, audio, game.model);

        $('#board .controller').removeClass('paipu')
        $('body').attr('class','board');
        scale($('#board'), $('#space'));
        applyBoardTransformScale();

        new Majiang.UI.GameCtl($('#board'), 'Majiang.pref', game, game._view);
        game.kaiju();
    }

    function end(paipu) {
        if (paipu) file.add(paipu, 10);
        fadeIn($('body').attr('class','file'));
        file.redraw();
    }

    $('#file .start').on('click', start);

    $(window).on('resize', ()=>scale($('#board'), $('#space')));

    setTimeout(()=>{
        $(window).on('load', function(){
            if (! file.isEmpty) return end();
            hide($('#title .loading'));
            const $presets = $('#title .presets');
            // default
            $presets.find('.preset[data-preset="default"]').on('click', ()=>{
                clearSelector('title');
                rule = Majiang.rule({});
                applyBoardTransformScale();
                start();
            });
            // Mリーグルール
            $presets.find('.preset[data-preset="Mリーグルール"]').on('click', ()=>{
                clearSelector('title');
                rule = Majiang.rule(require('./conf/rule.json')['Mリーグルール']);
                applyBoardTransformScale();
                start();
            });
            // Classicルール
            $presets.find('.preset[data-preset="Classicルール"]').on('click', ()=>{
                clearSelector('title');
                rule = Majiang.rule(require('./conf/rule.json')['Classicルール']);
                applyBoardTransformScale();
                start();
            });
            show($presets);
        });
        if (loaded) $(window).trigger('load');
    }, 1000);
});

$(window).on('load', ()=> loaded = true);
