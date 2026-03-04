import "extendscript-es5-shim-ts";

declare const $: any;
declare const Panel: any;
declare const Window: any;
declare const MarkerValue: any;
declare const KeyframeInterpolationType: any;
declare const PropertyType: any;
declare const PropertyValueType: any;
declare const CompItem: any;
declare function alert(msg: string): void;
declare function confirm(msg: string, noAsDefault?: boolean, title?: string): boolean;
declare function encodeURIComponent(s: string): string;
declare function decodeURIComponent(s: string): string;
declare function parseFloat(s: string): number;
declare function parseInt(s: string, radix?: number): number;
declare function isNaN(v: number): boolean;

interface StyleButtonDef {
    id: string;
    label: string;
    matchName: string;
    fallback: string;
    cmdId: number | null;
}

interface BlendModeEntry {
    name: string;
    val: number;
}

interface PropDef {
    label: string;
    key: string | string[];
    type: "number" | "color" | "blendMode" | "boolean";
}

interface ControlObj {
    prop: any;
    type: string;
    edit?: any;
    colorBtn?: any;
    dropdown?: any;
    kBtn?: any;
    pBtn?: any;
    nBtn?: any;
    hBtn?: any;
}

interface PColorPropPair {
    color: any;
    enable: any;
}

const STYLE_BUTTONS: StyleButtonDef[] = [
    { id: "innerShadow", label: "内シ", matchName: "innerShadow/enabled", fallback: "ADBE Layer Style Inner Shadow", cmdId: 9001 },
    { id: "bevelEmboss", label: "ベベ", matchName: "bevelEmboss/enabled", fallback: "ADBE Layer Style Bevel Emboss", cmdId: 9004 },
    { id: "dropShadow", label: "ドシ", matchName: "dropShadow/enabled", fallback: "ADBE Layer Style Drop Shadow", cmdId: 9000 },
    { id: "outerGlow", label: "外光", matchName: "outerGlow/enabled", fallback: "ADBE Layer Style Outer Glow", cmdId: 9002 },
    { id: "innerGlow", label: "内光", matchName: "innerGlow/enabled", fallback: "ADBE Layer Style Inner Glow", cmdId: 9003 },
    { id: "chromeFX", label: "サテ", matchName: "chromeFX/enabled", fallback: "ADBE Layer Style Satin", cmdId: 9005 },
    { id: "solidFill", label: "カラ", matchName: "solidFill/enabled", fallback: "ADBE Layer Style Color Overlay", cmdId: 9006 },
    { id: "gradientFill", label: "グラ", matchName: "gradientFill/enabled", fallback: "ADBE Layer Style Gradient Overlay", cmdId: 9007 },
    { id: "frameFX", label: "境界", matchName: "frameFX/enabled", fallback: "ADBE Layer Style Stroke", cmdId: 9008 },
    { id: "masterStyle", label: "全L", matchName: "ADBE Layer Styles", fallback: "ADBE Layer Styles", cmdId: null }
];

const MENU_CMD_MAP: { [id: string]: string[] } = {
    "dropShadow": ["ドロップシャドウ", "Drop Shadow"],
    "innerShadow": ["シャドウ(内側)", "シャドウ (内側)", "Inner Shadow"],
    "outerGlow": ["光彩(外側)", "光彩 (外側)", "Outer Glow"],
    "innerGlow": ["光彩(内側)", "光彩 (内側)", "Inner Glow"],
    "bevelEmboss": ["ベベルとエンボス", "Bevel and Emboss"],
    "chromeFX": ["サテン", "Satin"],
    "solidFill": ["カラーオーバーレイ", "Color Overlay"],
    "gradientFill": ["グラデーションオーバーレイ", "Gradient Overlay"],
    "frameFX": ["境界線", "Stroke"]
};

const blendModes: BlendModeEntry[] = [
    { name: "通常", val: 1 }, { name: "ﾃﾞｨｻﾞ", val: 2 }, { name: "比較(暗)", val: 4 }, { name: "乗算", val: 5 },
    { name: "焼込ｶﾗｰ", val: 6 }, { name: "焼込ﾘﾆｱ", val: 7 }, { name: "ｶﾗｰ比較(暗)", val: 8 },
    { name: "比較(明)", val: 10 }, { name: "ｽｸﾘｰﾝ", val: 11 }, { name: "覆焼ｶﾗｰ", val: 12 },
    { name: "覆焼ﾘﾆｱ", val: 13 }, { name: "ｶﾗｰ比較(明)", val: 14 }, { name: "ｵｰﾊﾞｰﾚｲ", val: 16 },
    { name: "ｿﾌﾄﾗｲﾄ", val: 17 }, { name: "ﾊｰﾄﾞﾗｲﾄ", val: 18 }, { name: "ﾋﾞﾋﾞｯﾄﾞ", val: 19 },
    { name: "ﾘﾆｱﾗｲﾄ", val: 20 }, { name: "ﾋﾟﾝﾗｲﾄ", val: 21 }, { name: "ﾊｰﾄﾞﾐｯｸｽ", val: 22 },
    { name: "差", val: 24 }, { name: "除外", val: 25 }, { name: "色相", val: 27 },
    { name: "彩度", val: 28 }, { name: "ｶﾗｰ", val: 29 }, { name: "輝度", val: 30 }
];

const blendModeNames: string[] = [];
for (let i = 0; i < blendModes.length; i++) { blendModeNames.push(blendModes[i].name); }

const PROP_DEF: { [id: string]: PropDef[] } = {
    "dropShadow": [{ label: "描画モード", key: ["blendMode2", "blendMode"], type: "blendMode" }, { label: "不透明度(0-100)", key: "Opacity", type: "number" }, { label: "角度(0-360)", key: "Angle", type: "number" }, { label: "距離(0-30000)", key: "Distance", type: "number" }, { label: "スプレッド(0-100)", key: "ChokeMatte", type: "number" }, { label: "サイズ(0-250)", key: "Blur", type: "number" }, { label: "ノイズ(0-250)", key: "Noise", type: "number" }, { label: "カラー", key: "Color", type: "color" }],
    "innerShadow": [{ label: "描画モード", key: ["blendMode2", "blendMode"], type: "blendMode" }, { label: "不透明度(0-100)", key: "Opacity", type: "number" }, { label: "角度(0-360)", key: "Angle", type: "number" }, { label: "距離(0-30000)", key: "Distance", type: "number" }, { label: "チョーク(0-100)", key: "ChokeMatte", type: "number" }, { label: "サイズ(0-250)", key: "Blur", type: "number" }, { label: "ノイズ(0-250)", key: "Noise", type: "number" }, { label: "カラー", key: "Color", type: "color" }],
    "outerGlow": [{ label: "描画モード", key: ["blendMode2", "blendMode"], type: "blendMode" }, { label: "不透明度(0-100)", key: "Opacity", type: "number" }, { label: "ノイズ(0-250)", key: "Noise", type: "number" }, { label: "カラー", key: "Color", type: "color" }, { label: "スプレッド(0-100)", key: "ChokeMatte", type: "number" }, { label: "サイズ(0-250)", key: "Blur", type: "number" }, { label: "範囲(1-100)", key: "Range", type: "number" }, { label: "ジッター(0-100)", key: ["Shading Noise", "Jitter"], type: "number" }],
    "innerGlow": [{ label: "描画モード", key: ["blendMode2", "blendMode"], type: "blendMode" }, { label: "不透明度(0-100)", key: "Opacity", type: "number" }, { label: "ノイズ(0-250)", key: "Noise", type: "number" }, { label: "カラー", key: "Color", type: "color" }, { label: "チョーク(0-100)", key: "ChokeMatte", type: "number" }, { label: "サイズ(0-250)", key: "Blur", type: "number" }, { label: "範囲(1-100)", key: "Range", type: "number" }, { label: "ジッター(0-100)", key: ["Shading Noise", "Jitter"], type: "number" }],
    "bevelEmboss": [{ label: "深さ(0-1000)", key: "Strength Ratio", type: "number" }, { label: "サイズ(0-250)", key: "Blur", type: "number" }, { label: "ソフト(0-16)", key: ["Soften", "Softness"], type: "number" }, { label: "角度(0-360)", key: "Angle", type: "number" }, { label: "Hモード", key: "highlightMode", type: "blendMode" }, { label: "H不透明度(0-100)", key: "highlightOpacity", type: "number" }, { label: "Hカラー", key: "highlightColor", type: "color" }, { label: "Sモード", key: "shadowMode", type: "blendMode" }, { label: "S不透明度(0-100)", key: "shadowOpacity", type: "number" }, { label: "Sカラー", key: "shadowColor", type: "color" }],
    "chromeFX": [{ label: "描画モード", key: ["blendMode2", "blendMode"], type: "blendMode" }, { label: "不透明度(0-100)", key: "Opacity", type: "number" }, { label: "角度(0-360)", key: "Angle", type: "number" }, { label: "距離(0-30000)", key: "Distance", type: "number" }, { label: "サイズ(0-250)", key: "Blur", type: "number" }, { label: "反転(0/1)", key: "Invert", type: "boolean" }, { label: "カラー", key: "Color", type: "color" }],
    "solidFill": [{ label: "描画モード", key: ["blendMode2", "blendMode"], type: "blendMode" }, { label: "不透明度(0-100)", key: "Opacity", type: "number" }, { label: "カラー", key: "Color", type: "color" }],
    "gradientFill": [{ label: "描画モード", key: ["blendMode2", "blendMode"], type: "blendMode" }, { label: "不透明度(0-100)", key: "Opacity", type: "number" }, { label: "角度(0-360)", key: "Angle", type: "number" }, { label: "スケール(10-150)", key: "Scale", type: "number" }],
    "frameFX": [{ label: "描画モード", key: ["blendMode2", "blendMode"], type: "blendMode" }, { label: "位置(外1/内2/中3)", key: ["Position", "Style"], type: "number" }, { label: "サイズ(0-250)", key: "Size", type: "number" }, { label: "不透明度(0-100)", key: "Opacity", type: "number" }, { label: "カラー", key: "Color", type: "color" }]
};

function makeOnDraw(initGDI: (b: any) => void, drawCore: (b: any) => void, guardKey: string): (this: any) => void {
    return function (this: any): void {
        if (!(this as any)[guardKey]) { initGDI(this); }
        try { drawCore(this); } catch (_) { /* ignore draw errors */ }
    };
}

class LayerStylePanel {
    private readonly panel: any;
    private readonly layerNameTxt: any;
    private styleNavBtns: any[] = [];
    private readonly globalPropGroup: any;
    private readonly stylePropsPanel: any;
    private pColorBtns: any[] = [];
    private chkBtn: any;

    // State
    private activeControls: ControlObj[] = [];
    private currentStyleId = "innerShadow";
    private isAutoUpdating = false;
    private currentLayerInfo: { layer: any; styleGroup: any } = { layer: null, styleGroup: null };
    private lastLayerHash = "";
    private lastValuesHash = "";
    private lastTime = 0;
    private _probe_lastActiveItemId = -1;
    private _probe_lastSelectedLayerId = -1;
    private _lastMouseOverTime = 0;

    constructor(_panel: any) {
        const isPanel = (typeof Panel !== "undefined") && (_panel instanceof Panel);
        this.panel = isPanel ? _panel : new Window("palette", "Layer Style Helper", undefined, { resizeable: true });
        this.panel.orientation = "column";
        this.panel.alignChildren = ["fill", "top"];
        this.panel.spacing = 6;
        this.panel.margins = 8;

        this.layerNameTxt = this.buildHeader();
        this.buildStyleNav();
        this.globalPropGroup = this.addGroup(this.panel, "column", ["fill", "top"], 0, [0, 4, 0, 4]);
        const midGrp = this.addGroup(this.panel, "row", ["left", "center"], 15, [0, 0, 0, 2]);
        this.buildPColorButtons(midGrp);
        this.buildNavButtons(midGrp);
        this.stylePropsPanel = this.addPanel(this.panel, "", "column", ["fill", "top"], 4, 8);

        this.setupPolling();
        try { this.refreshLayerInfo(); } catch (_) { /* ignore */ }
        if (this.panel instanceof Window) { this.panel.center(); this.panel.show(); }
        else { this.panel.layout.layout(true); }
    }

    // Build UI Funcs
    private addGroup(parent: any, orientation: string, align: string[], spacing?: number, margins?: number | number[]): any {
        const g = parent.add("group");
        g.orientation = orientation;
        g.alignChildren = align;
        if (spacing !== undefined) { g.spacing = spacing; }
        if (margins !== undefined) { g.margins = margins; }
        return g;
    }

    private addPanel(parent: any, title: string, orientation: string, align: string[], spacing?: number, margins?: number): any {
        const p = parent.add("panel", undefined, title);
        p.orientation = orientation;
        p.alignChildren = align;
        if (spacing !== undefined) { p.spacing = spacing; }
        if (margins !== undefined) { p.margins = margins; }
        return p;
    }

    private buildHeader(): any {
        const grp = this.addGroup(this.panel, "row", ["left", "center"], 6);
        grp.add("statictext", undefined, "対象:").preferredSize.width = 30;
        const txt = grp.add("statictext", undefined, "未選択");
        txt.preferredSize.width = 200;
        return txt;
    }

    private setupPolling(): void {
        const self = this;
        $.global._layerStylePro_checkRefresh = function (): void { self.checkRefresh(); };
        if ($.global._layerStylePro_watchTask) {
            try { app.cancelTask($.global._layerStylePro_watchTask); } catch (_) { /* ignore */ }
            $.global._layerStylePro_watchTask = null;
        }
        $.global._layerStylePro_watchTask = app.scheduleTask(
            "try{ $.global._layerStylePro_checkRefresh(); }catch(e){}", 1500, true
        );
        this.panel.addEventListener("mouseover", function (): void {
            const now = new Date().getTime();
            if (now - self._lastMouseOverTime > 1000) {
                self._lastMouseOverTime = now;
                try { self.checkRefresh(); } catch (_) { /* ignore */ }
            }
        });
    }

    private buildStyleNav(): void {
        const self = this;
        const grp = this.addGroup(this.panel, "row", ["center", "center"], 2);

        const initGDI = (btn: any): void => {
            const g = btn.graphics;
            btn.bgSel = g.newBrush(g.BrushType.SOLID_COLOR, [0.1, 0.5, 0.9]);
            btn.bgExt = g.newBrush(g.BrushType.SOLID_COLOR, [0.4, 0.4, 0.4]);
            btn.bgNon = g.newBrush(g.BrushType.SOLID_COLOR, [0.2, 0.2, 0.2]);
            btn.penRed = g.newPen(g.PenType.SOLID_COLOR, [1, 0.1, 0.1], 1);
            btn.txtW = g.newPen(g.PenType.SOLID_COLOR, [1, 1, 1], 1);
            btn.txtG = g.newPen(g.PenType.SOLID_COLOR, [0.6, 0.6, 0.6], 1);
        };
        const drawCore = (btn: any): void => {
            const g = btn.graphics;
            const w: number = btn.size[0];
            const h: number = btn.size[1];
            g.rectPath(0, 0, w, h);
            g.fillPath(btn.isSelected ? btn.bgSel : (btn.isExisting ? btn.bgExt : btn.bgNon));
            if (!btn.isExisting || !btn.isEnabled) {
                g.newPath(); g.moveTo(0, h); g.lineTo(w, 0); g.strokePath(btn.penRed);
            }
            g.drawString(btn.styleDef.label, btn.isExisting ? btn.txtW : btn.txtG, w / 2 - 8, h / 2 - 6);
        };

        for (let i = 0; i < STYLE_BUTTONS.length; i++) {
            const b: any = grp.add("button", undefined, "");
            b.preferredSize = [24, 24];
            b.styleDef = STYLE_BUTTONS[i];
            b.isExisting = false;
            b.isEnabled = false;
            b.isSelected = false;
            b.onDraw = makeOnDraw(initGDI, drawCore, "bgSel");
            b.addEventListener("mousedown", (function (idx: number) {
                return function (e: any): void {
                    const btn = self.styleNavBtns[idx];
                    const targetProp = self.getStyleGroupProp(btn.styleDef);
                    const comp = self.getActiveComp();
                    if (e.button === 2) {
                        if (btn.styleDef.id === "masterStyle") { return; }
                        app.beginUndoGroup("Add/Remove Layer Style");
                        if (targetProp && targetProp.enabled) {
                            if (comp && self.currentLayerInfo.layer) {
                                self.deselectAllLayers(comp);
                                self.currentLayerInfo.layer.selected = true;
                                targetProp.selected = true;
                                app.executeCommand(18);
                            }
                        } else {
                            if (comp && self.currentLayerInfo.layer) {
                                self.deselectAllLayers(comp);
                                self.currentLayerInfo.layer.selected = true;
                                const cmds = MENU_CMD_MAP[btn.styleDef.id];
                                let executed = false;
                                if (cmds) {
                                    for (let c = 0; c < cmds.length; c++) {
                                        const cmdId = app.findMenuCommandId(cmds[c]);
                                        if (cmdId !== 0) { app.executeCommand(cmdId); executed = true; break; }
                                    }
                                }
                                if (!executed && btn.styleDef.cmdId) { app.executeCommand(btn.styleDef.cmdId); }
                            }
                        }
                        app.endUndoGroup();
                        self.refreshLayerInfo();
                    } else if (e.button === 0) {
                        self.currentStyleId = btn.styleDef.id;
                        self.loadSelectedStyle();
                    }
                };
            })(i));
            this.styleNavBtns.push(b);
        }
    }

    private buildPColorButtons(parent: any): void {
        const self = this;
        const pColorGrp = parent.add("group");
        pColorGrp.orientation = "row";
        pColorGrp.spacing = 2;
        pColorGrp.visible = true;

        const initGDI = (b: any): void => {
            b.bgDef = b.graphics.newBrush(b.graphics.BrushType.SOLID_COLOR, [0.25, 0.25, 0.25]);
            b.penRed = b.graphics.newPen(b.graphics.PenType.SOLID_COLOR, [1, 0.1, 0.1], 2);
        };
        const drawCore = (b: any): void => {
            const g = b.graphics;
            const w: number = b.size[0];
            const h: number = b.size[1];
            g.rectPath(0, 0, w, h);
            g.fillPath(b.fillBrush || b.bgDef);
            if (b.isMissingFX) {
                g.newPath(); g.moveTo(0, 0); g.lineTo(w, h); g.strokePath(b.penRed);
                g.newPath(); g.moveTo(w, 0); g.lineTo(0, h); g.strokePath(b.penRed);
            } else if (b.isDisabled) {
                g.newPath(); g.moveTo(0, 0); g.lineTo(w, h); g.strokePath(b.penRed);
            }
        };

        for (let i = 0; i < 8; i++) {
            const cBtn: any = pColorGrp.add("button", undefined, "");
            cBtn.preferredSize = [16, 22];
            cBtn.visible = true;
            cBtn.isMissingFX = true;
            cBtn.onDraw = makeOnDraw(initGDI, drawCore, "bgDef");
            cBtn.addEventListener("mousedown", (function (idx: number) {
                return function (e: any): void {
                    const comp = self.getActiveComp();
                    if (!comp || comp.selectedLayers.length === 0) { return; }
                    const layer = comp.selectedLayers[0];
                    const btn = self.pColorBtns[idx];
                    if (btn.isMissingFX) {
                        if (e.button === 0) {
                            app.beginUndoGroup("Add P_Color");
                            try {
                                const fxGroup = layer.property("ADBE Effect Parade");
                                if (fxGroup) {
                                    let added = false;
                                    try { fxGroup.addProperty("P_ColorSelection"); added = true; } catch (_) {
                                        try { fxGroup.addProperty("ColorSelection"); added = true; } catch (_2) { /* ignore */ }
                                    }
                                    if (!added) { alert("P_Color エフェクトの追加に失敗しました。"); }
                                }
                            } catch (_) { /* ignore */ }
                            app.endUndoGroup();
                            self.checkRefresh();
                        }
                        return;
                    }
                    if (btn.targetColorProp) {
                        if (e.button === 2 && btn.targetEnableProp) {
                            app.beginUndoGroup("Toggle P_Color");
                            const newVal = (btn.targetEnableProp.value == 1 || btn.targetEnableProp.value == true) ? 0 : 1;
                            if (btn.targetEnableProp.numKeys > 0) { btn.targetEnableProp.setValueAtTime(comp.time, newVal); }
                            else { btn.targetEnableProp.setValue(newVal); }
                            app.endUndoGroup();
                            self.lastLayerHash = "";
                            self.checkRefresh();
                        } else if (e.button === 0) {
                            if (btn.targetEnableProp && (btn.targetEnableProp.value == 0 || btn.targetEnableProp.value == false)) {
                                app.beginUndoGroup("Auto-Enable P_Color");
                                if (btn.targetEnableProp.numKeys > 0) { btn.targetEnableProp.setValueAtTime(comp.time, 1); }
                                else { btn.targetEnableProp.setValue(1); }
                                app.endUndoGroup();
                            }
                            self.triggerDirectNativePicker(btn.targetColorProp);
                            self.lastLayerHash = "";
                            self.checkRefresh();
                        }
                    }
                };
            })(i));
            this.pColorBtns.push(cBtn);
        }
    }

    private buildNavButtons(parent: any): void {
        const self = this;
        const navGrp = parent.add("group");
        navGrp.orientation = "row";
        navGrp.spacing = 4;

        // CHK button
        this.chkBtn = navGrp.add("button", undefined, "CHK");
        this.chkBtn.preferredSize = [42, 22];
        this.chkBtn.state = 0;
        this.applyChkDraw(this.chkBtn);
        this.chkBtn.onClick = function (): void {
            if (self.currentStyleId === "innerShadow" || self.currentStyleId === "bevelEmboss") {
                self.toggleCheckMode();
            }
        };

        // Navigation draw helper
        const initNavGDI = (b: any): void => {
            b.bg = b.graphics.newBrush(b.graphics.BrushType.SOLID_COLOR, [0.25, 0.25, 0.25]);
            b.border = b.graphics.newPen(b.graphics.PenType.SOLID_COLOR, [0.1, 0.6, 0.9], 1);
            b.txtPen = b.graphics.newPen(b.graphics.PenType.SOLID_COLOR, [0.2, 0.8, 1], 1);
        };
        const drawNavCore = (b: any): void => {
            const g = b.graphics;
            const w: number = b.size[0];
            const h: number = b.size[1];
            g.rectPath(0, 0, w, h);
            g.fillPath(b.bg);
            g.strokePath(b.border);
            const txt: string = b.text;
            const offset = (txt.length > 2) ? 12 : 5;
            g.drawString(txt, b.txtPen, w / 2 - offset, h / 2 - 6);
        };
        const navOnDraw = makeOnDraw(initNavGDI, drawNavCore, "bg");

        const prevBtn = navGrp.add("button", undefined, "◁ 1F");
        prevBtn.preferredSize = [42, 22];
        prevBtn.onDraw = navOnDraw;
        prevBtn.onClick = function (): void {
            const c = self.getActiveComp();
            if (c) { c.time = Math.max(0, c.time - c.frameDuration); }
        };

        const uBtn = navGrp.add("button", undefined, "U");
        uBtn.preferredSize = [32, 22];
        uBtn.onDraw = navOnDraw;
        uBtn.onClick = function (): void {
            if (self.currentLayerInfo.layer && self.getActiveComp()) {
                app.beginUndoGroup("Toggle Keyframes");
                app.executeCommand(2387);
                app.endUndoGroup();
            }
        };

        const nextBtn = navGrp.add("button", undefined, "1F ▷");
        nextBtn.preferredSize = [42, 22];
        nextBtn.onDraw = navOnDraw;
        nextBtn.onClick = function (): void {
            const c = self.getActiveComp();
            if (c) { c.time = Math.min(c.duration, c.time + c.frameDuration); }
        };
    }

    private applyChkDraw(btn: any): void {
        const self = this;
        const initGDI = (b: any): void => {
            const g = b.graphics;
            b.bgOff = g.newBrush(g.BrushType.SOLID_COLOR, [0.25, 0.25, 0.25]);
            b.bgR = g.newBrush(g.BrushType.SOLID_COLOR, [0.8, 0.2, 0.2]);
            b.bgG = g.newBrush(g.BrushType.SOLID_COLOR, [0.2, 0.8, 0.2]);
            b.bgB = g.newBrush(g.BrushType.SOLID_COLOR, [0.2, 0.4, 1.0]);
            b.bgRB = g.newBrush(g.BrushType.SOLID_COLOR, [0.6, 0.2, 0.6]);
            b.border = g.newPen(g.PenType.SOLID_COLOR, [0.1, 0.6, 0.9], 1);
            b.borderOff = g.newPen(g.PenType.SOLID_COLOR, [0.2, 0.2, 0.2], 1);
            b.txtPen = g.newPen(g.PenType.SOLID_COLOR, [1, 1, 1], 1);
            b.txtPenOff = g.newPen(g.PenType.SOLID_COLOR, [0.2, 0.8, 1], 1);
            b.txtPenDis = g.newPen(g.PenType.SOLID_COLOR, [0.4, 0.4, 0.4], 1);
        };
        const drawCore = (b: any): void => {
            const g = b.graphics;
            const w: number = b.size[0];
            const h: number = b.size[1];
            g.rectPath(0, 0, w, h);
            const valid = (self.currentStyleId === "innerShadow" || self.currentStyleId === "bevelEmboss");
            if (!valid) {
                g.fillPath(b.bgOff); g.strokePath(b.borderOff);
                g.drawString("CHK", b.txtPenDis, w / 2 - 12, h / 2 - 6);
                return;
            }
            const bg = b.state === 1 ? b.bgR : (b.state === 2 ? b.bgG : (b.state === 3 ? b.bgB : (b.state === 4 ? b.bgRB : b.bgOff)));
            g.fillPath(bg); g.strokePath(b.border);
            const txt = b.state === 0 ? "CHK" : (b.state === 1 ? "■ R" : (b.state === 2 ? "■ G" : (b.state === 3 ? "■ B" : "■ R/B")));
            const pen = b.state === 0 ? b.txtPenOff : b.txtPen;
            const offset = (txt.length > 3) ? 14 : 12;
            g.drawString(txt, pen, w / 2 - offset, h / 2 - 6);
        };
        btn.onDraw = makeOnDraw(initGDI, drawCore, "bgOff");
    }

    // Helper Funcs
    private getActiveComp(): any {
        try {
            return (app && app.project && app.project.activeItem instanceof CompItem) ? app.project.activeItem : null;
        } catch (_) { return null; }
    }

    private deselectAllLayers(comp: any): void {
        const sel = comp.selectedLayers;
        for (let s = 0; s < sel.length; s++) { sel[s].selected = false; }
    }

    private getPropByKeysSafe(parentProp: any, keys: string[]): any {
        if (!parentProp) { return null; }
        for (let i = 0; i < keys.length; i++) {
            try {
                const p = parentProp.property("ADBE " + keys[i]) || parentProp.property(keys[i]);
                if (p) { return p; }
            } catch (_) { /* ignore */ }
            for (let j = 1; j <= parentProp.numProperties; j++) {
                try {
                    const child = parentProp.property(j);
                    if (child.matchName.toLowerCase().indexOf(keys[i].toLowerCase()) !== -1 ||
                        child.name.toLowerCase().indexOf(keys[i].toLowerCase()) !== -1) {
                        return child;
                    }
                } catch (_) { /* ignore */ }
            }
        }
        return null;
    }

    private getStyleGroupProp(styleDef: StyleButtonDef): any {
        if (!this.currentLayerInfo.styleGroup || !styleDef) { return null; }
        if (styleDef.id === "masterStyle") { return this.currentLayerInfo.styleGroup; }
        for (let i = 1; i <= this.currentLayerInfo.styleGroup.numProperties; i++) {
            const p = this.currentLayerInfo.styleGroup.property(i);
            if (p.matchName === styleDef.matchName || p.matchName === styleDef.fallback) { return p; }
        }
        return null;
    }

    private getActiveStyleDef(): StyleButtonDef | null {
        for (let i = 0; i < STYLE_BUTTONS.length; i++) {
            if (STYLE_BUTTONS[i].id === this.currentStyleId) { return STYLE_BUTTONS[i]; }
        }
        return null;
    }

    private resetPColorBtn(btn: any): void {
        btn.isMissingFX = true;
        btn.targetColorProp = null;
        btn.targetEnableProp = null;
        btn.isDisabled = false;
        try { btn.fillBrush = btn.graphics.newBrush(btn.graphics.BrushType.SOLID_COLOR, [0.25, 0.25, 0.25]); } catch (_) { /* ignore */ }
    }

    //  Check Mode
    private addCheckMarker(layer: any, comp: any): void {
        const markerProp = layer.property("ADBE Marker") || layer.property("Marker");
        if (!markerProp) { return; }
        let t = layer.inPoint;
        if (markerProp.numKeys > 0) {
            const idx = markerProp.nearestKeyIndex(t);
            if (Math.abs(markerProp.keyTime(idx) - t) < 0.001) { t += comp.frameDuration; }
        }
        markerProp.setValueAtTime(t, new MarkerValue("CHECK中"));
    }

    private removeCheckMarker(layer: any): void {
        const markerProp = layer.property("ADBE Marker") || layer.property("Marker");
        if (!markerProp) { return; }
        for (let m = markerProp.numKeys; m >= 1; m--) {
            if (markerProp.keyValue(m).comment === "CHECK中") { markerProp.removeKey(m); }
        }
    }

    private ensureStyleExists(comp: any, layer: any, def: StyleButtonDef): any {
        let prop = this.getStyleGroupProp(def);
        if (!prop) {
            app.beginUndoGroup("Add " + def.id);
            this.deselectAllLayers(comp);
            layer.selected = true;
            if (def.cmdId) { app.executeCommand(def.cmdId); }
            prop = this.getStyleGroupProp(def);
            const sel = comp.selectedLayers;
            for (let s = 0; s < sel.length; s++) { sel[s].selected = true; }
            if (!prop) { app.endUndoGroup(); return null; }
        }
        return prop;
    }

    private toggleCheckMode(): void {
        const comp = this.getActiveComp();
        if (!comp || comp.selectedLayers.length === 0) { return; }
        const layer = comp.selectedLayers[0];

        if (this.currentStyleId === "innerShadow") {
            const IS_DEF = STYLE_BUTTONS[0]; // innerShadow
            const isProp = this.ensureStyleExists(comp, layer, IS_DEF);
            if (!isProp) { return; }
            const blendProp = this.getPropByKeysSafe(isProp, ["blendMode2", "blendMode"]);
            const opProp = this.getPropByKeysSafe(isProp, ["Opacity"]);
            const colProp = this.getPropByKeysSafe(isProp, ["Color"]);
            if (!blendProp || !opProp || !colProp) { return; }
            app.beginUndoGroup("Toggle 内シ Check Mode");
            if (!isProp.enabled) { isProp.enabled = true; }
            const exp: string = colProp.expression || "";
            const isCheckMode = exp.indexOf("/*LSC_CHK|") !== -1;
            if (!isCheckMode) {
                const meta = "/*LSC_CHK|" + blendProp.value + "|" + encodeURIComponent(opProp.expression || "") + "|" + encodeURIComponent(colProp.expression || "") + "*/\n";
                colProp.expression = meta + "[1, 0, 0, 1];";
                opProp.expression = meta + "100;";
                blendProp.setValue(1);
                this.addCheckMarker(layer, comp);
            } else {
                const parts = exp.split("*/\n")[0].replace("/*LSC_CHK|", "").split("|");
                const currentTarget: string = exp.split("*/\n")[1] || "";
                if (currentTarget.indexOf("[1, 0, 0, 1]") !== -1) {
                    colProp.expression = "/*LSC_CHK|" + parts[0] + "|" + parts[1] + "|" + parts[2] + "*/\n[0, 1, 0, 1];";
                } else if (currentTarget.indexOf("[0, 1, 0, 1]") !== -1) {
                    colProp.expression = "/*LSC_CHK|" + parts[0] + "|" + parts[1] + "|" + parts[2] + "*/\n[0, 0, 1, 1];";
                } else {
                    colProp.expression = decodeURIComponent(parts[2]);
                    opProp.expression = decodeURIComponent(parts[1]);
                    blendProp.setValue(parseInt(parts[0], 10));
                    this.removeCheckMarker(layer);
                }
            }
            app.endUndoGroup();
        } else if (this.currentStyleId === "bevelEmboss") {
            const BE_DEF = STYLE_BUTTONS[1]; // bevelEmboss
            const bevProp = this.ensureStyleExists(comp, layer, BE_DEF);
            if (!bevProp) { return; }
            const hmProp = this.getPropByKeysSafe(bevProp, ["highlightMode"]);
            const hoProp = this.getPropByKeysSafe(bevProp, ["highlightOpacity"]);
            const hcProp = this.getPropByKeysSafe(bevProp, ["highlightColor"]);
            const smProp = this.getPropByKeysSafe(bevProp, ["shadowMode"]);
            const soProp = this.getPropByKeysSafe(bevProp, ["shadowOpacity"]);
            const scProp = this.getPropByKeysSafe(bevProp, ["shadowColor"]);
            if (!hmProp || !hcProp || !scProp) { return; }
            app.beginUndoGroup("Toggle ベベ Check Mode");
            if (!bevProp.enabled) { bevProp.enabled = true; }
            const exp: string = hcProp.expression || "";
            const isCheckMode = exp.indexOf("/*LSC_CHK_BEV|") !== -1;
            if (!isCheckMode) {
                const meta = "/*LSC_CHK_BEV|" + hmProp.value + "|" + encodeURIComponent(hoProp.expression || "") + "|" + encodeURIComponent(hcProp.expression || "") + "|" + smProp.value + "|" + encodeURIComponent(soProp.expression || "") + "|" + encodeURIComponent(scProp.expression || "") + "*/\n";
                hcProp.expression = meta + "[1, 0, 0, 1];";
                hoProp.expression = meta + "100;";
                hmProp.setValue(1);
                scProp.expression = meta + "[0, 0, 1, 1];";
                soProp.expression = meta + "100;";
                smProp.setValue(1);
                this.addCheckMarker(layer, comp);
            } else {
                const parts = exp.split("*/\n")[0].replace("/*LSC_CHK_BEV|", "").split("|");
                hcProp.expression = decodeURIComponent(parts[2]);
                hoProp.expression = decodeURIComponent(parts[1]);
                hmProp.setValue(parseInt(parts[0], 10));
                scProp.expression = decodeURIComponent(parts[5]);
                soProp.expression = decodeURIComponent(parts[4]);
                smProp.setValue(parseInt(parts[3], 10));
                this.removeCheckMarker(layer);
            }
            app.endUndoGroup();
        }
        this.syncValuesFromAE(true);
    }

    //  Value Operations
    private triggerDirectNativePicker(targetProp: any): void {
        const comp = this.getActiveComp();
        if (!comp || !targetProp) { return; }
        try {
            const selLayers = comp.selectedLayers;
            this.deselectAllLayers(comp);
            if (this.currentLayerInfo.layer) { this.currentLayerInfo.layer.selected = true; }
            if (targetProp.canVaryOverTime && targetProp.numKeys > 0) {
                const t = comp.time;
                const nearestIdx = targetProp.nearestKeyIndex(t);
                if (!(nearestIdx > 0 && Math.abs(targetProp.keyTime(nearestIdx) - t) < 0.005)) {
                    targetProp.setValueAtTime(t, targetProp.value);
                }
            }
            targetProp.selected = true;
            if (targetProp.numKeys > 0) {
                const t = comp.time;
                let onKeyIndex = -1;
                const nearestIdx = targetProp.nearestKeyIndex(t);
                if (nearestIdx > 0 && Math.abs(targetProp.keyTime(nearestIdx) - t) < 0.005) { onKeyIndex = nearestIdx; }
                for (let k = 1; k <= targetProp.numKeys; k++) {
                    targetProp.setSelectedAtKey(k, k === onKeyIndex);
                }
            }
            app.executeCommand(app.findMenuCommandId("Edit Value...") || 2240);
            for (let i = 0; i < selLayers.length; i++) { selLayers[i].selected = true; }
        } catch (_) { /* ignore */ }
        this.syncValuesFromAE(true);
    }

    private applyValueToAE(prop: any, value: any): void {
        const comp = this.getActiveComp();
        app.beginUndoGroup("Change Value");
        try {
            if (prop.numKeys > 0 && comp) { prop.setValueAtTime(comp.time, value); }
            else { prop.setValue(value); }
        } catch (_) { /* ignore */ }
        app.endUndoGroup();
        this.syncValuesFromAE(true);
    }

    private operateKeyframe(prop: any, action: string): void {
        if (!prop || !prop.canVaryOverTime) { return; }
        const comp = this.getActiveComp();
        if (!comp) { return; }
        const t = comp.time;
        app.beginUndoGroup("K-Frame Control");
        try {
            if (action === "add") {
                prop.setValueAtTime(t, prop.value);
            } else if (action === "remove") {
                if (prop.numKeys > 0) {
                    const idx = prop.nearestKeyIndex(t);
                    if (Math.abs(prop.keyTime(idx) - t) < 0.005) { prop.removeKey(idx); }
                }
            } else if (action === "prev") {
                if (prop.numKeys > 0) {
                    let idx = prop.nearestKeyIndex(t);
                    if (prop.keyTime(idx) >= t - 0.001) { idx--; }
                    if (idx > 0) { comp.time = prop.keyTime(idx); }
                }
            } else if (action === "next") {
                if (prop.numKeys > 0) {
                    let idx = prop.nearestKeyIndex(t);
                    if (prop.keyTime(idx) <= t + 0.001) { idx++; }
                    if (idx <= prop.numKeys) { comp.time = prop.keyTime(idx); }
                }
            } else if (action === "toggle_hold") {
                this.toggleHoldKeyframes(prop, comp);
            }
        } catch (_) { /* ignore */ }
        app.endUndoGroup();
        this.syncValuesFromAE(true);
    }

    private toggleHoldKeyframes(prop: any, comp: any): void {
        if (prop.numKeys <= 0) { return; }
        const currentIsHold = (prop.keyOutInterpolationType(1) === KeyframeInterpolationType.HOLD);
        if (!currentIsHold) {
            const waStart = comp.workAreaStart;
            const waEnd = waStart + comp.workAreaDuration;
            let hasOutsideKeys = false;
            for (let k = 1; k <= prop.numKeys; k++) {
                const kt = prop.keyTime(k);
                if (kt < waStart - 0.001 || kt > waEnd + 0.001) { hasOutsideKeys = true; break; }
            }
            if (hasOutsideKeys) {
                if (confirm("ワークエリア外にキーフレームがあります。\nこれらを一括削除してからベイクしますか？", false, "Clean Outside Keyframes")) {
                    for (let k = prop.numKeys; k >= 1; k--) {
                        const kt = prop.keyTime(k);
                        if (kt < waStart - 0.001 || kt > waEnd + 0.001) { prop.removeKey(k); }
                    }
                }
            }
            if (prop.numKeys > 1) {
                const tStart = prop.keyTime(1);
                const tEnd = prop.keyTime(prop.numKeys);
                const fd = comp.frameDuration;
                const bakedValues: any[] = [];
                const bakedTimes: number[] = [];
                for (let fTime = tStart; fTime <= tEnd + 0.0001; fTime += fd) {
                    bakedTimes.push(fTime);
                    bakedValues.push(prop.valueAtTime(fTime, false));
                }
                prop.setValuesAtTimes(bakedTimes, bakedValues);
            }
            for (let k = 1; k <= prop.numKeys; k++) {
                prop.setInterpolationTypeAtKey(k, KeyframeInterpolationType.HOLD, KeyframeInterpolationType.HOLD);
            }
            try { if (prop.setLabelAtKey) { prop.setLabelAtKey(1, 1); prop.setLabelAtKey(prop.numKeys, 1); } } catch (_) { /* ignore */ }
        } else {
            for (let k = prop.numKeys - 1; k >= 2; k--) { prop.removeKey(k); }
            if (prop.numKeys >= 1) {
                prop.setInterpolationTypeAtKey(1, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
                try { if (prop.setLabelAtKey) { prop.setLabelAtKey(1, 0); } } catch (_) { /* ignore */ }
            }
            if (prop.numKeys >= 2) {
                prop.setInterpolationTypeAtKey(2, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
                try { if (prop.setLabelAtKey) { prop.setLabelAtKey(2, 0); } } catch (_) { /* ignore */ }
            }
        }
    }

    //  Property Control Builder
    private createPropControl(parent: any, label: string, prop: any, type: string): void {
        if (!prop) { return; }
        const self = this;
        const grp = parent.add("group");
        grp.orientation = "row";
        grp.alignChildren = ["left", "center"];
        grp.spacing = 4;
        const labelTxt = grp.add("statictext", undefined, label);
        labelTxt.preferredSize.width = 115;
        const baseLabel = label.split("(")[0];

        if (baseLabel === "描画モード" || baseLabel === "不透明度" || baseLabel === "角度" || baseLabel === "サイズ") {
            const initCyan = (b: any): void => { b.cyanPen = b.graphics.newPen(b.graphics.PenType.SOLID_COLOR, [0.1, 0.7, 1], 1); };
            const drawCyan = (b: any): void => { b.graphics.drawString(b.text, b.cyanPen, 0, 4, b.graphics.font); };
            labelTxt.onDraw = makeOnDraw(initCyan, drawCyan, "cyanPen");
        }

        const isDimmed = (baseLabel === "塗りの不透明度");
        const ctrlObj: ControlObj = { prop: prop, type: type };
        const editGrp = grp.add("group");
        editGrp.spacing = 0;

        if (type === "number" || type === "boolean") {
            this.buildNumberControl(ctrlObj, editGrp, prop, type, baseLabel);
        } else if (type === "color") {
            this.buildColorControl(ctrlObj, editGrp, prop);
        } else if (type === "blendMode") {
            ctrlObj.dropdown = editGrp.add("dropdownlist", undefined, blendModeNames);
            ctrlObj.dropdown.preferredSize = [81, 22];
            ctrlObj.dropdown.onChange = function (this: any): void {
                if (self.isAutoUpdating || !this.selection) { return; }
                self.applyValueToAE(prop, blendModes[this.selection.index].val);
            };
        }

        // Keyframe buttons
        const kfGrp = grp.add("group");
        kfGrp.spacing = 1;
        kfGrp.margins = [2, 0, 0, 0];
        const kBtn = kfGrp.add("button", undefined, "");
        const pBtn = kfGrp.add("button", undefined, "");
        const nBtn = kfGrp.add("button", undefined, "");
        const dBtn = kfGrp.add("button", undefined, "");
        const hBtn = kfGrp.add("button", undefined, "");
        kBtn.preferredSize = pBtn.preferredSize = nBtn.preferredSize = dBtn.preferredSize = hBtn.preferredSize = [22, 22];
        kBtn.state = { isBlue: false, text: "K" };
        pBtn.state = { isBlue: false, text: "◀" };
        nBtn.state = { isBlue: false, text: "▶" };
        dBtn.state = { isBlue: false, text: "－" };
        hBtn.state = { isBlue: false, isHold: false, text: "■" };
        this.applyKDraw(kBtn, isDimmed);
        this.applyKDraw(pBtn, isDimmed);
        this.applyKDraw(nBtn, isDimmed);
        this.applyKDraw(dBtn, isDimmed);
        this.applyKDraw(hBtn, isDimmed);

        if (!prop.canVaryOverTime) {
            kBtn.enabled = pBtn.enabled = nBtn.enabled = dBtn.enabled = hBtn.enabled = false;
        } else {
            kBtn.onClick = function (): void { self.operateKeyframe(prop, "add"); };
            pBtn.onClick = function (): void { self.operateKeyframe(prop, "prev"); };
            nBtn.onClick = function (): void { self.operateKeyframe(prop, "next"); };
            dBtn.onClick = function (): void { self.operateKeyframe(prop, "remove"); };
            hBtn.onClick = function (): void { self.operateKeyframe(prop, "toggle_hold"); };
        }
        ctrlObj.kBtn = kBtn;
        ctrlObj.pBtn = pBtn;
        ctrlObj.nBtn = nBtn;
        ctrlObj.hBtn = hBtn;
        this.activeControls.push(ctrlObj);
    }

    private buildNumberControl(ctrlObj: ControlObj, editGrp: any, prop: any, type: string, baseLabel: string): void {
        const self = this;
        ctrlObj.edit = editGrp.add("edittext", undefined, "0");
        ctrlObj.edit.preferredSize = [45, 22];
        const upBtn = editGrp.add("button", undefined, "▲");
        const dnBtn = editGrp.add("button", undefined, "▼");
        upBtn.preferredSize = dnBtn.preferredSize = [18, 22];
        const scrubState = { dragging: false, lastX: 0, lastTime: 0 };

        const endScrub = (): void => {
            if (scrubState.dragging) {
                scrubState.dragging = false;
                try { app.endUndoGroup(); } catch (_) { /* ignore */ }
                self.syncValuesFromAE(true);
            }
        };

        ctrlObj.edit.addEventListener("mousedown", function (e: any): void {
            if (scrubState.dragging) { try { app.endUndoGroup(); } catch (_) { /* ignore */ } }
            scrubState.dragging = true;
            scrubState.lastX = e.screenX;
            scrubState.lastTime = new Date().getTime();
            app.beginUndoGroup("Scrub Value");
        });

        ctrlObj.edit.addEventListener("mousemove", function (e: any): void {
            if (!scrubState.dragging || !prop) { return; }
            const now = new Date().getTime();
            if (now - scrubState.lastTime > 1000) { endScrub(); return; }
            scrubState.lastTime = now;
            const tickDelta = e.screenX - scrubState.lastX;
            if (tickDelta === 0) { return; }
            if (Math.abs(tickDelta) > 50) { scrubState.lastX = e.screenX; return; }
            let baseSens = 1;
            if (baseLabel === "深さ" || baseLabel === "角度") { baseSens = 2; }
            let mult = 1;
            if (e.shiftKey) { mult = 10; }
            else if (e.ctrlKey || e.metaKey) { mult = 0.1; }
            const currentValue = parseFloat(ctrlObj.edit.text) || 0;
            let newValue = currentValue + (tickDelta * baseSens * mult);
            newValue = self.clampByLabel(baseLabel, newValue);
            if (e.ctrlKey || e.metaKey) { newValue = Math.round(newValue * 10) / 10; }
            else { newValue = Math.round(newValue); }
            if (newValue !== currentValue) {
                ctrlObj.edit.text = newValue;
                const comp = self.getActiveComp();
                try {
                    if (prop.numKeys > 0 && comp) { prop.setValueAtTime(comp.time, newValue); }
                    else { prop.setValue(newValue); }
                } catch (_) { /* ignore */ }
            }
            scrubState.lastX = e.screenX;
        });

        ctrlObj.edit.addEventListener("mouseout", endScrub);
        ctrlObj.edit.addEventListener("mouseup", endScrub);
        ctrlObj.edit.addEventListener("blur", endScrub);

        ctrlObj.edit.onChange = function (this: any): void {
            if (self.isAutoUpdating) { return; }
            const val = parseFloat(this.text);
            if (!isNaN(val)) { self.applyValueToAE(prop, type === "boolean" ? (val !== 0) : val); }
        };
        upBtn.onClick = function (): void {
            if (self.isAutoUpdating) { return; }
            const s = (type === "number" && prop.matchName.toLowerCase().indexOf("angle") > -1) ? 5 : 1;
            const val = (type === "boolean" ? (prop.value ? 1 : 0) : prop.value) + s;
            self.applyValueToAE(prop, type === "boolean" ? (val !== 0) : val);
        };
        dnBtn.onClick = function (): void {
            if (self.isAutoUpdating) { return; }
            const s = (type === "number" && prop.matchName.toLowerCase().indexOf("angle") > -1) ? 5 : 1;
            const val = (type === "boolean" ? (prop.value ? 1 : 0) : prop.value) - s;
            self.applyValueToAE(prop, type === "boolean" ? (val !== 0) : val);
        };
    }

    private buildColorControl(ctrlObj: ControlObj, editGrp: any, prop: any): void {
        const self = this;
        ctrlObj.colorBtn = editGrp.add("button", undefined, "");
        ctrlObj.colorBtn.preferredSize = [81, 22];
        const initColor = (b: any): void => {
            const c = prop.value;
            b.fillBrush = b.graphics.newBrush(b.graphics.BrushType.SOLID_COLOR, [c[0], c[1], c[2]]);
        };
        const drawColor = (b: any): void => {
            b.graphics.rectPath(0, 0, b.size[0], b.size[1]);
            b.graphics.fillPath(b.fillBrush);
        };
        ctrlObj.colorBtn.onDraw = makeOnDraw(initColor, drawColor, "fillBrush");
        ctrlObj.colorBtn.onClick = function (): void {
            if (self.isAutoUpdating) { return; }
            self.triggerDirectNativePicker(prop);
        };
    }

    private clampByLabel(baseLabel: string, v: number): number {
        if (baseLabel === "不透明度" || baseLabel === "H不透明度" || baseLabel === "S不透明度" || baseLabel === "スプレッド" || baseLabel === "チョーク" || baseLabel === "ジッター") {
            return Math.max(0, Math.min(100, v));
        } else if (baseLabel === "ノイズ") { return Math.max(0, Math.min(250, v)); }
        else if (baseLabel === "ソフト") { return Math.max(0, Math.min(16, v)); }
        else if (baseLabel === "角度") { v = v % 360; return v < 0 ? v + 360 : v; }
        else if (baseLabel === "サイズ" || baseLabel === "Size") { return Math.max(0, Math.min(250, v)); }
        else if (baseLabel === "距離") { return Math.max(0, Math.min(30000, v)); }
        else if (baseLabel === "深さ") { return Math.max(0, Math.min(1000, v)); }
        else if (baseLabel === "範囲") { return Math.max(1, Math.min(100, v)); }
        else if (baseLabel === "スケール") { return Math.max(10, Math.min(150, v)); }
        return v;
    }

    private applyKDraw(btn: any, isDimmed: boolean): void {
        const initGDI = (b: any): void => {
            const g = b.graphics;
            b.bgBlue = g.newBrush(g.BrushType.SOLID_COLOR, [0.1, 0.5, 0.9]);
            b.bgGray = g.newBrush(g.BrushType.SOLID_COLOR, [0.22, 0.22, 0.22]);
            b.txtWhite = g.newPen(g.PenType.SOLID_COLOR, [1, 1, 1], 1);
            b.txtGray = g.newPen(g.PenType.SOLID_COLOR, [0.4, 0.4, 0.4], 1);
        };
        const drawCore = (b: any): void => {
            const g = b.graphics;
            const w: number = b.size[0];
            const h: number = b.size[1];
            g.rectPath(0, 0, w, h);
            g.fillPath(b.state.isBlue ? b.bgBlue : b.bgGray);
            const activePen = (isDimmed && !b.state.isBlue) ? b.txtGray : b.txtWhite;
            let txt: string = b.state.text;
            if (txt === "■" || txt === "◆") { txt = b.state.isHold ? "◆" : "■"; }
            const offset = (txt === "K" || txt === "■" || txt === "◆" || txt === "－") ? 5 : 6;
            g.drawString(txt, activePen, w / 2 - offset, h / 2 - 6);
        };
        btn.onDraw = makeOnDraw(initGDI, drawCore, "bgBlue");
    }

    //  P_Color Helpers
    private getPColorEffect(fxGrp: any): any {
        if (!fxGrp) { return null; }
        for (let j = 1; j <= fxGrp.numProperties; j++) {
            const p = fxGrp.property(j);
            const mn: string = p.matchName || "";
            const nm: string = p.name || "";
            if (mn.indexOf("ColorSelection") !== -1 || nm.indexOf("ColorSelection") !== -1) { return p; }
        }
        return null;
    }

    private extractPColorProps(parent: any, propsArray: PColorPropPair[]): void {
        for (let j = 1; j <= parent.numProperties; j++) {
            const p = parent.property(j);
            if (p.propertyType === PropertyType.PROPERTY && p.propertyValueType === PropertyValueType.COLOR) {
                let eProp = (j > 1) ? parent.property(j - 1) : null;
                if (eProp && eProp.propertyValueType !== PropertyValueType.OneD) { eProp = null; }
                propsArray.push({ color: p, enable: eProp });
            } else if (p.propertyType === PropertyType.NAMED_GROUP || p.propertyType === PropertyType.INDEXED_GROUP) {
                this.extractPColorProps(p, propsArray);
            }
        }
    }

    //  Refresh / Sync
    private getLayerHash(layer: any): string {
        if (!layer) { return ""; }
        let hash = (layer.containingComp ? layer.containingComp.id : "0") + "_" + layer.index;
        const sg = layer.property("ADBE Layer Styles");
        if (sg) {
            hash += "_S" + sg.numProperties;
            for (let i = 1; i <= sg.numProperties; i++) {
                try { hash += (sg.property(i).enabled ? "1" : "0"); } catch (_) { /* ignore */ }
            }
        }
        const fxGrp = layer.property("ADBE Effect Parade");
        if (fxGrp) { hash += "_F" + fxGrp.numProperties; }
        return hash;
    }

    private refreshLayerInfo(): void {
        const comp = this.getActiveComp();
        if (!comp || !(comp instanceof CompItem) || comp.selectedLayers.length === 0) {
            if (this.layerNameTxt) { this.layerNameTxt.text = "未選択"; }
            for (let i = 0; i < 8; i++) {
                this.resetPColorBtn(this.pColorBtns[i]);
                this.pColorBtns[i].notify("onDraw");
            }
            while (this.globalPropGroup.children.length > 0) { this.globalPropGroup.remove(0); }
            while (this.stylePropsPanel.children.length > 0) { this.stylePropsPanel.remove(0); }
            this.activeControls = [];
            this.panel.layout.layout(true);
            this.currentLayerInfo.layer = null;
            this.lastLayerHash = "";
            return;
        }
        this.currentLayerInfo.layer = comp.selectedLayers[0];
        if (this.layerNameTxt) { this.layerNameTxt.text = this.currentLayerInfo.layer.name; }
        this.currentLayerInfo.styleGroup = this.currentLayerInfo.layer.property("ADBE Layer Styles");
        const activeDef = this.getActiveStyleDef();
        const activeProp = activeDef ? this.getStyleGroupProp(activeDef) : null;
        if (!activeProp || (activeDef && activeDef.id !== "masterStyle" && !activeProp.enabled)) {
            for (let i = 0; i < STYLE_BUTTONS.length; i++) {
                if (STYLE_BUTTONS[i].id === "masterStyle") { continue; }
                const p = this.getStyleGroupProp(STYLE_BUTTONS[i]);
                if (p && p.enabled) { this.currentStyleId = STYLE_BUTTONS[i].id; break; }
            }
        }
        this.loadSelectedStyle();
        this.chkBtn.notify("onDraw");
    }

    private loadSelectedStyle(): void {
        while (this.globalPropGroup.children.length > 0) { this.globalPropGroup.remove(0); }
        while (this.stylePropsPanel.children.length > 0) { this.stylePropsPanel.remove(0); }
        this.activeControls = [];
        if (this.currentLayerInfo.styleGroup) {
            try {
                const blendOptions = this.currentLayerInfo.styleGroup.property("ADBE Blend Options Group");
                const advGroup = blendOptions ? blendOptions.property("ADBE Adv Blend Group") : null;
                const fillProp = advGroup ? (advGroup.property("ADBE Layer Fill Opacity2") || advGroup.property("ADBE Layer Fill Opacity")) : null;
                if (fillProp) { this.createPropControl(this.globalPropGroup, "塗りの不透明度(0-100)", fillProp, "number"); }
            } catch (_) { /* ignore */ }
        }
        const defs = PROP_DEF[this.currentStyleId];
        const activeDef = this.getActiveStyleDef();
        const activeProp = activeDef ? this.getStyleGroupProp(activeDef) : null;
        if (defs && activeProp && activeProp.enabled) {
            for (let i = 0; i < defs.length; i++) {
                let prop: any = null;
                const keySuffixes: string[] = typeof defs[i].key === "string" ? [defs[i].key as string] : defs[i].key as string[];
                for (let k = 0; k < keySuffixes.length; k++) {
                    const sfx = keySuffixes[k];
                    try {
                        prop = activeProp.property("ADBE " + sfx) || activeProp.property(sfx);
                        if (prop) { break; }
                    } catch (_) { /* ignore */ }
                    for (let j = 1; j <= activeProp.numProperties; j++) {
                        try {
                            const child = activeProp.property(j);
                            if (child.matchName.toLowerCase().indexOf(sfx.toLowerCase()) !== -1 ||
                                child.name.toLowerCase().indexOf(sfx.toLowerCase()) !== -1) {
                                prop = child;
                                break;
                            }
                        } catch (_) { /* ignore */ }
                    }
                    if (prop) { break; }
                }
                if (prop) { this.createPropControl(this.stylePropsPanel, defs[i].label, prop, defs[i].type); }
            }
        }
        this.panel.layout.layout(true);
        this.syncValuesFromAE(true);
    }

    private syncValuesFromAE(force: boolean): void {
        if (!this.currentLayerInfo.layer) { return; }
        this.isAutoUpdating = true;

        this.syncPColorButtons();
        this.syncStyleNavButtons();
        this.syncChkState();
        this.syncControlValues(force);

        this.isAutoUpdating = false;
    }

    private syncPColorButtons(): void {
        const fxGrp = this.currentLayerInfo.layer.property("ADBE Effect Parade");
        const pColorFx = this.getPColorEffect(fxGrp);
        const pColorProps: PColorPropPair[] = [];
        if (pColorFx) { this.extractPColorProps(pColorFx, pColorProps); }
        for (let i = 0; i < 8; i++) {
            const btn = this.pColorBtns[i];
            if (i < pColorProps.length) {
                const pcData = pColorProps[i];
                btn.isMissingFX = false;
                btn.targetColorProp = pcData.color;
                btn.targetEnableProp = pcData.enable;
                btn.isDisabled = (pcData.enable && (pcData.enable.value == 0 || pcData.enable.value == false));
                const c = pcData.color.value;
                try { btn.fillBrush = btn.graphics.newBrush(btn.graphics.BrushType.SOLID_COLOR, [c[0], c[1], c[2]]); } catch (_) { /* ignore */ }
            } else {
                this.resetPColorBtn(btn);
            }
            btn.notify("onDraw");
        }
    }

    private syncStyleNavButtons(): void {
        for (let i = 0; i < this.styleNavBtns.length; i++) {
            const b = this.styleNavBtns[i];
            const p = this.getStyleGroupProp(b.styleDef);
            const existing = (p !== null);
            let active = false;
            if (b.styleDef.id === "masterStyle") { active = existing; }
            else if (p) { try { active = p.enabled; } catch (_) { /* ignore */ } }
            const selected = (this.currentStyleId === b.styleDef.id);
            if (b.isExisting !== existing || b.isEnabled !== active || b.isSelected !== selected) {
                b.isExisting = existing;
                b.isEnabled = active;
                b.isSelected = selected;
                b.notify("onDraw");
            }
        }
    }

    private syncChkState(): void {
        let isChkState = 0;
        if (this.currentStyleId === "innerShadow") {
            const isProp = this.getPropByKeysSafe(this.currentLayerInfo.styleGroup, ["ADBE Layer Style Inner Shadow", "innerShadow/enabled"]);
            if (isProp) {
                const cProp = this.getPropByKeysSafe(isProp, ["Color"]);
                if (cProp && cProp.expression && cProp.expression.indexOf("/*LSC_CHK|") !== -1) {
                    const expStr: string = cProp.expression;
                    if (expStr.indexOf("[1, 0, 0, 1]") !== -1) { isChkState = 1; }
                    else if (expStr.indexOf("[0, 1, 0, 1]") !== -1) { isChkState = 2; }
                    else if (expStr.indexOf("[0, 0, 1, 1]") !== -1) { isChkState = 3; }
                }
            }
        } else if (this.currentStyleId === "bevelEmboss") {
            const bevProp = this.getPropByKeysSafe(this.currentLayerInfo.styleGroup, ["ADBE Layer Style Bevel Emboss", "bevelEmboss/enabled"]);
            if (bevProp) {
                const hcProp = this.getPropByKeysSafe(bevProp, ["highlightColor"]);
                if (hcProp && hcProp.expression && hcProp.expression.indexOf("/*LSC_CHK_BEV|") !== -1) { isChkState = 4; }
            }
        }
        if (this.chkBtn.state !== isChkState) { this.chkBtn.state = isChkState; this.chkBtn.notify("onDraw"); }
    }

    private syncControlValues(force: boolean): void {
        const comp = this.getActiveComp();
        for (let i = 0; i < this.activeControls.length; i++) {
            const ctrl = this.activeControls[i];
            if (!ctrl.prop) { continue; }
            try {
                const val = ctrl.prop.value;
                if (ctrl.type === "number" && ctrl.edit && (!ctrl.edit.active || force)) {
                    const strVal = String(Math.round(val * 10) / 10);
                    if (ctrl.edit.text !== strVal && !ctrl.edit.active) { ctrl.edit.text = strVal; }
                } else if (ctrl.type === "boolean" && ctrl.edit && (!ctrl.edit.active || force)) {
                    const strVal = val ? "1" : "0";
                    if (ctrl.edit.text !== strVal && !ctrl.edit.active) { ctrl.edit.text = strVal; }
                } else if (ctrl.type === "color") {
                    const r = val[0] * 255;
                    const g = val[1] * 255;
                    const b = val[2] * 255;
                    const currColor = ctrl.colorBtn.fillBrush ? ctrl.colorBtn.fillBrush.color : [-1, -1, -1];
                    if (Math.abs(currColor[0] * 255 - r) > 1 || Math.abs(currColor[1] * 255 - g) > 1 || Math.abs(currColor[2] * 255 - b) > 1) {
                        try { ctrl.colorBtn.fillBrush = ctrl.colorBtn.graphics.newBrush(ctrl.colorBtn.graphics.BrushType.SOLID_COLOR, [r / 255, g / 255, b / 255]); } catch (_) { /* ignore */ }
                        ctrl.colorBtn.notify("onDraw");
                    }
                } else if (ctrl.type === "blendMode" && ctrl.dropdown && (!ctrl.dropdown.active || force)) {
                    for (let bIdx = 0; bIdx < blendModes.length; bIdx++) {
                        if (blendModes[bIdx].val === val && (!ctrl.dropdown.selection || ctrl.dropdown.selection.index !== bIdx)) {
                            const temp = ctrl.dropdown.onChange;
                            ctrl.dropdown.onChange = null;
                            ctrl.dropdown.selection = bIdx;
                            ctrl.dropdown.onChange = temp;
                            break;
                        }
                    }
                }

                if (ctrl.prop.canVaryOverTime && comp) {
                    const t = comp.time;
                    const numK = ctrl.prop.numKeys;
                    let onK = false;
                    let hasPrev = false;
                    let hasNext = false;
                    if (numK > 0) {
                        const idx = ctrl.prop.nearestKeyIndex(t);
                        const kt = ctrl.prop.keyTime(idx);
                        onK = Math.abs(kt - t) < 0.005;
                        if (onK) { hasPrev = (idx > 1); hasNext = (idx < numK); }
                        else if (kt < t) { hasPrev = true; hasNext = (idx < numK); }
                        else if (kt > t) { hasNext = true; hasPrev = (idx > 1); }
                    }
                    if (ctrl.kBtn && ctrl.kBtn.state.isBlue !== onK) { ctrl.kBtn.state.isBlue = onK; ctrl.kBtn.notify("onDraw"); }
                    if (ctrl.pBtn && ctrl.pBtn.state.isBlue !== hasPrev) { ctrl.pBtn.state.isBlue = hasPrev; ctrl.pBtn.notify("onDraw"); }
                    if (ctrl.nBtn && ctrl.nBtn.state.isBlue !== hasNext) { ctrl.nBtn.state.isBlue = hasNext; ctrl.nBtn.notify("onDraw"); }
                    if (ctrl.hBtn) {
                        let isHold = false;
                        if (numK > 0) { isHold = (ctrl.prop.keyOutInterpolationType(1) === KeyframeInterpolationType.HOLD); }
                        if (ctrl.hBtn.state.isHold !== isHold) { ctrl.hBtn.state.isHold = isHold; ctrl.hBtn.notify("onDraw"); }
                    }
                }
            } catch (_) { /* ignore */ }
        }
    }

    private getValuesHash(): string {
        let h = "";
        for (let i = 0; i < this.activeControls.length; i++) {
            if (this.activeControls[i].prop) { try { h += this.activeControls[i].prop.value.toString() + "_"; } catch (_) { /* ignore */ } }
        }
        if (this.currentLayerInfo.layer) {
            try {
                const fxGrp = this.currentLayerInfo.layer.property("ADBE Effect Parade");
                const pColorFx = this.getPColorEffect(fxGrp);
                if (pColorFx) {
                    const pcArr: PColorPropPair[] = [];
                    this.extractPColorProps(pColorFx, pcArr);
                    for (let j = 0; j < pcArr.length; j++) {
                        h += pcArr[j].color.value.toString() + "_";
                        if (pcArr[j].enable) { h += pcArr[j].enable.value.toString() + "_"; }
                    }
                }
            } catch (_) { /* ignore */ }
        }
        return h;
    }

    //  Polling
    private checkRefresh(): void {
        if ($.global._LSC_SyncPaused) { return; }
        try {
            const comp = this.getActiveComp();
            const currentItemId = (comp && comp instanceof CompItem) ? comp.id : -1;
            const currentLayerId = (comp && comp instanceof CompItem && comp.selectedLayers.length > 0) ? comp.selectedLayers[0].id : -1;

            if (currentItemId === this._probe_lastActiveItemId && currentLayerId === this._probe_lastSelectedLayerId) {
                if (currentLayerId === -1) { return; }
            }
            this._probe_lastActiveItemId = currentItemId;
            this._probe_lastSelectedLayerId = currentLayerId;

            if (!comp || !(comp instanceof CompItem) || comp.selectedLayers.length === 0) {
                if (this.layerNameTxt && this.layerNameTxt.text !== "未選択") { this.layerNameTxt.text = "未選択"; }
                if (this.lastLayerHash !== "") { this.lastLayerHash = ""; this.refreshLayerInfo(); }
                return;
            }
            const layer = comp.selectedLayers[0];
            if (this.layerNameTxt && this.layerNameTxt.text !== layer.name) { this.layerNameTxt.text = layer.name; }
            const hash = this.getLayerHash(layer);
            if (hash !== this.lastLayerHash) {
                this.lastLayerHash = hash;
                this.refreshLayerInfo();
                this.lastValuesHash = this.getValuesHash();
                this.lastTime = comp.time;
            } else {
                const currentValuesHash = this.getValuesHash();
                if (comp.time !== this.lastTime || currentValuesHash !== this.lastValuesHash) {
                    this.syncValuesFromAE(false);
                    this.lastTime = comp.time;
                    this.lastValuesHash = this.getValuesHash();
                }
            }
        } catch (_) { /* ignore */ }
    }
}

$.global.LayerStylePanel = LayerStylePanel;
