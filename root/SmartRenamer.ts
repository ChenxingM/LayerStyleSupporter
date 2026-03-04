import "extendscript-es5-shim-ts";

declare const $: any;
declare const Panel: any;
declare const Window: any;
declare const KeyframeInterpolationType: any;
declare const PropertyType: any;
declare const CompItem: any;
declare function confirm(msg: string, noAsDefault?: boolean, title?: string): boolean;

interface CompBlock {
    group: any;
    lbl: any;
    ed: any;
    jmp: any;
}

const LABEL_COLORS: number[][] = [
    [0.30, 0.30, 0.30], [0.70, 0.15, 0.15], [0.85, 0.75, 0.15], [0.15, 0.70, 0.65],
    [0.85, 0.45, 0.65], [0.55, 0.40, 0.85], [0.90, 0.55, 0.40], [0.45, 0.80, 0.60],
    [0.15, 0.40, 0.85], [0.15, 0.65, 0.15], [0.45, 0.15, 0.60], [0.90, 0.40, 0.10],
    [0.50, 0.30, 0.15], [0.80, 0.15, 0.45], [0.10, 0.60, 0.85], [0.65, 0.50, 0.40],
    [0.10, 0.40, 0.20]
];

const NAME_LIST: string[] = [
    "名▼", "line", "瞳", "白目", "肌", "服", "髪", "襟", "歯", "釦",
    "鍔", "柄頭", "柄", "鞘", "羽織", "袖", "口中", "隊服", "ベルト", "鼻緒", "草履"
];

const SUFFIX_LIST: string[] = ["影", "ハイライト", "照り返し", "リムライト", "ベース"];

function getActiveComp(): any {
    try {
        return (app && app.project && app.project.activeItem instanceof CompItem) ? app.project.activeItem : null;
    } catch (e) { return null; }
}

function getCompById(id: number): any {
    try {
        for (let i = 1; i <= app.project.numItems; i++) {
            if (app.project.item(i).id === id) return app.project.item(i);
        }
    } catch (e) { /* ignore */ }
    return null;
}

function makeOnDraw(initGDI: (b: any) => void, drawCore: (b: any) => void, guardKey: string): (this: any) => void {
    return function (this: any): void {
        if (!(this as any)[guardKey]) { initGDI(this); }
        try { drawCore(this); } catch (_) { /* ignore */ }
    };
}

function makeLabelDraw(btn: any): void {
    btn.onDraw = makeOnDraw(
        function (b: any): void {
            b.bgBrushes = [];
            for (let c = 0; c < 17; c++) {
                b.bgBrushes.push(b.graphics.newBrush(b.graphics.BrushType.SOLID_COLOR, LABEL_COLORS[c]));
            }
            b.borderPen = b.graphics.newPen(b.graphics.PenType.SOLID_COLOR, [0.1, 0.1, 0.1], 1);
        },
        function (b: any): void {
            b.graphics.rectPath(0, 0, b.size[0], b.size[1]);
            b.graphics.fillPath(b.bgBrushes[b.labelColorIndex || 0]);
            b.graphics.strokePath(b.borderPen);
        },
        "bgBrushes"
    );
}

class SmartRenamer {
    private readonly panel: any;
    private readonly mainGrp: any;
    private readonly upBtn: any;
    private readonly compBlocks: CompBlock[] = [];
    private readonly compEdits: any[] = [];
    private readonly layerNameEdit: any;
    private readonly layerLblBtn: any;

    private _lastCompHash = "";
    private _lastLayerHash = "";
    private _probe_lastActiveItemId = -1;
    private _probe_lastSelectedLayerId = -1;
    private _lastMouseOverTime = 0;

    private static readonly MAX_LEVELS = 4;

    constructor(_panel: any) {
        const isPanel = (typeof Panel !== "undefined") && (_panel instanceof Panel);
        this.panel = isPanel ? _panel : new Window("palette", "Smart Renamer", undefined, { resizeable: true });
        this.panel.margins = isPanel ? 4 : 8;
        this.panel.spacing = 8;
        this.panel.orientation = "row";
        this.panel.alignChildren = ["left", "center"];

        this.mainGrp = this.addGroup(this.panel, "row", ["left", "center"], 8, 4);
        this.upBtn = this.buildToolGroup(this.mainGrp);
        this.addSeparator(this.mainGrp);
        this.buildHierarchyGroup(this.mainGrp);
        this.addSeparator(this.mainGrp);
        const layerResult = this.buildLayerGroup(this.mainGrp);
        this.layerNameEdit = layerResult.nameEdit;
        this.layerLblBtn = layerResult.lblBtn;

        this.setupPolling();
        try { this.checkRefresh(); } catch (_) { /* ignore */ }
        if (this.panel instanceof Window) {
            this.panel.onResizing = this.panel.onResize = function (this: any): void { this.layout.resize(); };
            this.panel.center();
            this.panel.show();
        } else {
            this.panel.layout.layout(true);
        }
    }

    // Build UI Funcs
    private addGroup(parent: any, orientation: string, align: string[], spacing?: number, margins?: number | number[]): any {
        const g = parent.add("group");
        g.orientation = orientation;
        g.alignChildren = align;
        if (spacing !== undefined) g.spacing = spacing;
        if (margins !== undefined) g.margins = margins;
        return g;
    }

    private addSeparator(parent: any): void {
        const sep = parent.add("panel", undefined, "");
        sep.preferredSize = [2, 20];
        sep.maximumSize = [2, 20];
        sep.minimumSize = [2, 20];
    }

    private withSelectedLayer(undoName: string, action: (layer: any) => void, refresh?: boolean): void {
        const comp = getActiveComp();
        if (!comp || comp.selectedLayers.length === 0) return;
        app.beginUndoGroup(undoName);
        try { action(comp.selectedLayers[0]); } catch (e) { /* ignore */ }
        app.endUndoGroup();
        if (refresh) $.global._smartRenamerPro_checkRefresh();
    }

    private buildToolGroup(parent: any): any {
        const grp = this.addGroup(parent, "row", ["left", "center"], 2);

        const upBtn = grp.add("button", undefined, "↑");
        upBtn.preferredSize = [24, 22];
        upBtn.helpTip = "一つ上の階層へ";
        upBtn.enabled = false;
        upBtn.onClick = function (): void {
            const comp = getActiveComp();
            if (comp && comp.usedIn && comp.usedIn.length > 0) comp.usedIn[0].openInViewer();
        };

        const bakeBtn = grp.add("button", undefined, "■");
        bakeBtn.preferredSize = [22, 22];
        bakeBtn.helpTip = "【Bake & Hold】選択中の全プロパティをベイク/解除します";
        const self = this;
        bakeBtn.onClick = function (): void { self.bakeUnbakeProperties(); };

        const soloBtn = grp.add("button", undefined, "S");
        soloBtn.preferredSize = [22, 22];
        soloBtn.helpTip = "Solo (独立表示)";
        soloBtn.onClick = function (): void {
            self.withSelectedLayer("Toggle Solo", function (layer: any): void { layer.solo = !layer.solo; }, true);
        };

        const expandBtn = grp.add("button", undefined, "◩");
        expandBtn.preferredSize = [22, 22];
        expandBtn.helpTip = "レイヤースタイルを展開";
        expandBtn.onClick = function (): void {
            self.withSelectedLayer("Toggle Expand", function (layer: any): void {
                const styleGrp = layer.property("ADBE Layer Styles");
                if (styleGrp) styleGrp.selected = true;
                app.executeCommand(app.findMenuCommandId("Reveal Selected Properties") || 2771);
            });
        };

        const fxToggleBtn = grp.add("button", undefined, "FX");
        fxToggleBtn.preferredSize = [22, 22];
        fxToggleBtn.helpTip = "FX一括切替";
        fxToggleBtn.onClick = function (): void {
            const comp = getActiveComp();
            if (!comp || comp.selectedLayers.length === 0) return;
            const layer = comp.selectedLayers[0];
            const fxGroup = layer.property("ADBE Effect Parade");
            if (!fxGroup || fxGroup.numProperties === 0) return;
            app.beginUndoGroup("FX Toggle");
            let targetState: boolean | null = null;
            for (let i = 1; i <= fxGroup.numProperties; i++) {
                const fx = fxGroup.property(i);
                if (fx.name.indexOf("カラーキー") === -1 && fx.name.indexOf("Color Key") === -1) {
                    if (targetState === null) targetState = !fx.enabled;
                    try { fx.enabled = targetState; } catch (e) { /* ignore */ }
                }
            }
            app.endUndoGroup();
        };

        const syncBtn = grp.add("button", undefined, "⏸");
        syncBtn.preferredSize = [22, 22];
        syncBtn.helpTip = "【全体休止】パネルの自動同期を一時停止";
        syncBtn.onClick = function (): void {
            $.global._LSC_SyncPaused = !$.global._LSC_SyncPaused;
            syncBtn.text = $.global._LSC_SyncPaused ? "▶" : "⏸";
            if (!$.global._LSC_SyncPaused) {
                $.global._smartRenamerPro_checkRefresh();
                if (typeof $.global._layerStylePro_checkRefresh === "function") $.global._layerStylePro_checkRefresh();
            }
        };

        return upBtn;
    }

    private buildHierarchyGroup(parent: any): void {
        const hierGrp = this.addGroup(parent, "row", ["left", "center"], 2);

        for (let i = 0; i < SmartRenamer.MAX_LEVELS; i++) {
            const block = this.addGroup(hierGrp, "row", ["left", "center"], 2);

            const lblBtn = block.add("button", undefined, "");
            lblBtn.preferredSize = [12, 22];
            lblBtn.labelColorIndex = 0;
            lblBtn.compID = null;
            makeLabelDraw(lblBtn);
            lblBtn.addEventListener("mousedown", function (this: any, e: any): void {
                if (!this.compID) return;
                const targetComp = getCompById(this.compID);
                if (targetComp) {
                    app.beginUndoGroup("Change Comp Label");
                    const cur: number = targetComp.label;
                    if (e.button === 0) targetComp.label = (cur + 1) % 17;
                    else if (e.button === 2) targetComp.label = (cur + 16) % 17;
                    app.endUndoGroup();
                    $.global._smartRenamerPro_checkRefresh();
                }
            });

            const ed = block.add("edittext", undefined, "");
            ed.preferredSize.width = 90;
            ed.compID = null;
            ed.hasFocus = false;
            ed.onActivate = function (this: any): void { this.hasFocus = true; };
            ed.onDeactivate = function (this: any): void { this.hasFocus = false; };
            ed.onChange = function (this: any): void {
                if (this.compID) {
                    const targetComp = getCompById(this.compID);
                    if (targetComp && targetComp.name !== this.text) {
                        app.beginUndoGroup("Rename Comp");
                        try { targetComp.name = this.text; } catch (e) { /* ignore */ }
                        app.endUndoGroup();
                    }
                }
                this.hasFocus = false;
            };
            ed.addEventListener("keydown", function (this: any, e: any): void {
                if (e.keyName === "Enter") this.active = false;
            });
            this.compEdits.push(ed);

            const jumpBtn = block.add("button", undefined, "▶");
            jumpBtn.preferredSize = [20, 22];
            jumpBtn.compID = null;
            jumpBtn.onClick = function (this: any): void {
                if (this.compID) {
                    const targetComp = getCompById(this.compID);
                    if (targetComp) targetComp.openInViewer();
                }
            };

            this.compBlocks.push({ group: block, lbl: lblBtn, ed: ed, jmp: jumpBtn });
        }
    }

    private buildLayerGroup(parent: any): { nameEdit: any; lblBtn: any } {
        const grp = this.addGroup(parent, "row", ["left", "center"], 4);

        const lblBtn = grp.add("button", undefined, "");
        lblBtn.preferredSize = [12, 22];
        lblBtn.labelColorIndex = 0;
        makeLabelDraw(lblBtn);
        lblBtn.addEventListener("mousedown", function (this: any, e: any): void {
            const comp = getActiveComp();
            if (comp && comp.selectedLayers.length > 0) {
                app.beginUndoGroup("Change Layer Label");
                const cur: number = comp.selectedLayers[0].label;
                if (e.button === 0) comp.selectedLayers[0].label = (cur + 1) % 17;
                else if (e.button === 2) comp.selectedLayers[0].label = (cur + 16) % 17;
                app.endUndoGroup();
                $.global._smartRenamerPro_checkRefresh();
            }
        });

        grp.add("statictext", undefined, "L:").preferredSize.width = 15;

        const nameEdit = grp.add("edittext", undefined, "未選択");
        nameEdit.preferredSize.width = 85;
        nameEdit.hasFocus = false;
        nameEdit.onActivate = function (this: any): void { this.hasFocus = true; };
        nameEdit.onDeactivate = function (this: any): void { this.hasFocus = false; };
        nameEdit.onChange = function (this: any): void {
            const comp = getActiveComp();
            if (comp && comp.selectedLayers.length > 0) {
                if (comp.selectedLayers[0].name !== this.text) {
                    app.beginUndoGroup("Rename Layer");
                    try { comp.selectedLayers[0].name = this.text; } catch (e) { /* ignore */ }
                    app.endUndoGroup();
                }
            }
            this.hasFocus = false;
        };
        nameEdit.addEventListener("keydown", function (this: any, e: any): void {
            if (e.keyName === "Enter") this.active = false;
        });

        const baseNameDrop = grp.add("dropdownlist", undefined, NAME_LIST);
        baseNameDrop.selection = 0;
        baseNameDrop.preferredSize.width = 50;
        baseNameDrop.onChange = function (this: any): void {
            if (this.selection.index === 0) return;
            const comp = getActiveComp();
            if (!comp || comp.selectedLayers.length === 0) { this.selection = 0; return; }
            app.beginUndoGroup("Replace Layer Name");
            try {
                comp.selectedLayers[0].name = this.selection.text;
                nameEdit.text = comp.selectedLayers[0].name;
            } catch (e) { /* ignore */ }
            app.endUndoGroup();
            this.selection = 0;
        };

        const pushBtn = grp.add("button", undefined, "＋");
        pushBtn.preferredSize = [24, 22];

        const suffixDrop = grp.add("dropdownlist", undefined, SUFFIX_LIST);
        suffixDrop.selection = 0;
        suffixDrop.preferredSize.width = 76;

        pushBtn.onClick = function (): void {
            const comp = getActiveComp();
            if (!comp || comp.selectedLayers.length === 0) return;
            app.beginUndoGroup("Rename Suffix");
            try {
                const layer = comp.selectedLayers[0];
                const n = layer.name.replace(/\s+\d+$/, "");
                layer.name = n + suffixDrop.selection.text;
                nameEdit.text = layer.name;
            } catch (e) { /* ignore */ }
            app.endUndoGroup();
        };

        return { nameEdit: nameEdit, lblBtn: lblBtn };
    }

    // Bake/Unbake
    private bakeUnbakeProperties(): void {
        const comp = getActiveComp();
        if (!comp || comp.selectedProperties.length === 0) return;

        const props: any[] = [];
        for (let i = 0; i < comp.selectedProperties.length; i++) {
            const p = comp.selectedProperties[i];
            if (p.propertyType === PropertyType.PROPERTY && p.canVaryOverTime && p.numKeys > 1) props.push(p);
        }
        if (props.length === 0) return;

        app.beginUndoGroup("Global Bake/Unbake Properties");
        const waStart: number = comp.workAreaStart;
        const waEnd: number = waStart + comp.workAreaDuration;
        let hasOutsideKeys = false;
        let needsBakeCount = 0;

        for (let i = 0; i < props.length; i++) {
            const p = props[i];
            const currentIsHold = (p.keyOutInterpolationType(1) === KeyframeInterpolationType.HOLD);
            if (!currentIsHold) {
                needsBakeCount++;
                for (let k = 1; k <= p.numKeys; k++) {
                    const kt: number = p.keyTime(k);
                    if (kt < waStart - 0.001 || kt > waEnd + 0.001) { hasOutsideKeys = true; break; }
                }
            }
        }

        let doClean = false;
        if (hasOutsideKeys && needsBakeCount > 0) {
            doClean = confirm(
                "ワークエリア外にキーフレームが検出されました。\nこれらを一括削除してからベイクしますか？",
                false, "Clean Outside Keyframes"
            );
        }

        for (let i = 0; i < props.length; i++) {
            const prop = props[i];
            const currentIsHold = (prop.keyOutInterpolationType(1) === KeyframeInterpolationType.HOLD);
            if (!currentIsHold) {
                if (doClean) {
                    for (let k = prop.numKeys; k >= 1; k--) {
                        const kt: number = prop.keyTime(k);
                        if (kt < waStart - 0.001 || kt > waEnd + 0.001) prop.removeKey(k);
                    }
                }
                if (prop.numKeys < 2) continue;
                const fd: number = comp.frameDuration;
                const bakedValues: any[] = [];
                const bakedTimes: number[] = [];
                const tStart: number = prop.keyTime(1);
                const tEnd: number = prop.keyTime(prop.numKeys);
                for (let fTime = tStart; fTime <= tEnd + 0.0001; fTime += fd) {
                    bakedTimes.push(fTime);
                    bakedValues.push(prop.valueAtTime(fTime, false));
                }
                prop.setValuesAtTimes(bakedTimes, bakedValues);
                for (let k = 1; k <= prop.numKeys; k++) {
                    prop.setInterpolationTypeAtKey(k, KeyframeInterpolationType.HOLD, KeyframeInterpolationType.HOLD);
                }
                try { if (prop.setLabelAtKey) { prop.setLabelAtKey(1, 1); prop.setLabelAtKey(prop.numKeys, 1); } } catch (e) { /* ignore */ }
            } else {
                for (let k = prop.numKeys - 1; k >= 2; k--) { prop.removeKey(k); }
                if (prop.numKeys >= 1) {
                    prop.setInterpolationTypeAtKey(1, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
                    try { if (prop.setLabelAtKey) prop.setLabelAtKey(1, 0); } catch (e) { /* ignore */ }
                }
                if (prop.numKeys >= 2) {
                    prop.setInterpolationTypeAtKey(2, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
                    try { if (prop.setLabelAtKey) prop.setLabelAtKey(2, 0); } catch (e) { /* ignore */ }
                }
            }
        }
        app.endUndoGroup();
    }

    // Sync/Refresh
    private checkRefresh(): void {
        if ($.global._LSC_SyncPaused) return;
        for (let i = 0; i < this.compEdits.length; i++) {
            if (this.compEdits[i].hasFocus) return;
        }
        if (this.layerNameEdit.hasFocus) return;

        try {
            const comp = getActiveComp();
            const currentItemId = comp ? comp.id : -1;
            const currentLayerId = (comp && comp.selectedLayers.length > 0) ? comp.selectedLayers[0].id : -1;

            if (currentItemId === this._probe_lastActiveItemId && currentLayerId === this._probe_lastSelectedLayerId) {
                if (currentItemId === -1) return;
            }
            this._probe_lastActiveItemId = currentItemId;
            this._probe_lastSelectedLayerId = currentLayerId;

            if (comp) {
                const hasParent = (comp.usedIn && comp.usedIn.length > 0);
                if (this.upBtn.enabled !== hasParent) this.upBtn.enabled = hasParent;

                const chain: any[] = [comp];
                let currentTrace = comp;
                while (chain.length < SmartRenamer.MAX_LEVELS && currentTrace.usedIn && currentTrace.usedIn.length > 0) {
                    currentTrace = currentTrace.usedIn[0];
                    chain.push(currentTrace);
                }
                chain.reverse();

                let currentCompHash = "";
                for (let ci = 0; ci < chain.length; ci++) {
                    currentCompHash += chain[ci].id + "_" + chain[ci].name + "_" + chain[ci].label + "|";
                }

                if (currentCompHash !== this._lastCompHash) {
                    this._lastCompHash = currentCompHash;
                    for (let bi = 0; bi < SmartRenamer.MAX_LEVELS; bi++) {
                        const blk = this.compBlocks[bi];
                        if (bi < chain.length) {
                            blk.group.visible = true;
                            if (blk.ed.text !== chain[bi].name) blk.ed.text = chain[bi].name;
                            blk.ed.compID = chain[bi].id;
                            blk.jmp.compID = chain[bi].id;
                            blk.lbl.compID = chain[bi].id;
                            if (blk.lbl.labelColorIndex !== chain[bi].label) {
                                blk.lbl.labelColorIndex = chain[bi].label;
                                blk.lbl.notify("onDraw");
                            }
                            blk.jmp.visible = (bi < chain.length - 1);
                        } else {
                            blk.group.visible = false;
                            blk.ed.compID = null;
                            blk.jmp.compID = null;
                            blk.lbl.compID = null;
                        }
                    }
                    this.panel.layout.layout(true);
                }

                if (comp.selectedLayers.length > 0) {
                    const activeLayer = comp.selectedLayers[0];
                    const currentLayerSig = activeLayer.id + "_" + activeLayer.name + "_" + activeLayer.label;
                    if (currentLayerSig !== this._lastLayerHash) {
                        this._lastLayerHash = currentLayerSig;
                        if (this.layerNameEdit.text !== activeLayer.name) this.layerNameEdit.text = activeLayer.name;
                        if (this.layerLblBtn.labelColorIndex !== activeLayer.label) {
                            this.layerLblBtn.labelColorIndex = activeLayer.label;
                            this.layerLblBtn.notify("onDraw");
                        }
                    }
                } else {
                    if (this._lastLayerHash !== "") {
                        this._lastLayerHash = "";
                        if (this.layerNameEdit.text !== "未選択") this.layerNameEdit.text = "未選択";
                        this.layerLblBtn.labelColorIndex = 0;
                        this.layerLblBtn.notify("onDraw");
                    }
                }
            } else {
                if (this.upBtn.enabled) this.upBtn.enabled = false;
                if (this._lastCompHash !== "") {
                    this._lastCompHash = "";
                    this._lastLayerHash = "";
                    for (let ri = 0; ri < SmartRenamer.MAX_LEVELS; ri++) {
                        this.compBlocks[ri].group.visible = false;
                        this.compBlocks[ri].ed.compID = null;
                        this.compBlocks[ri].jmp.compID = null;
                        this.compBlocks[ri].lbl.compID = null;
                    }
                    if (this.layerNameEdit.text !== "未選択") this.layerNameEdit.text = "未選択";
                    this.layerLblBtn.labelColorIndex = 0;
                    this.layerLblBtn.notify("onDraw");
                    this.panel.layout.layout(true);
                }
            }
        } catch (e) { /* ignore */ }
    }

    // Polling
    private setupPolling(): void {
        const self = this;
        $.global._smartRenamerPro_checkRefresh = function (): void { self.checkRefresh(); };

        if ($.global._smartRenamerPro_watchTask) {
            try { app.cancelTask($.global._smartRenamerPro_watchTask); } catch (e) { /* ignore */ }
            $.global._smartRenamerPro_watchTask = null;
        }
        $.global._smartRenamerPro_watchTask = app.scheduleTask(
            "try{ $.global._smartRenamerPro_checkRefresh(); }catch(e){}", 1500, true
        );

        const handleMouseOver = function (): void {
            const now = new Date().getTime();
            if (now - self._lastMouseOverTime > 1000) {
                self._lastMouseOverTime = now;
                try { self.checkRefresh(); } catch (e) { /* ignore */ }
            }
        };
        this.panel.addEventListener("mouseover", handleMouseOver);
        this.mainGrp.addEventListener("mouseover", handleMouseOver);
    }
}

$.global.SmartRenamer = SmartRenamer;
