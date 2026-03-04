import os
import glob
import subprocess
import traceback
import win32com.client


def main():
    dir_name = __file__.replace("\\", "/").split("/")[-2]
    parent_dir = os.path.dirname(__file__) + "/ScriptUI Panel"

    panels = []
    for src in glob.glob(parent_dir + "/*.jsx"):
        if "(" not in os.path.basename(src):
            panels.append(src)

    scripts_dirs = glob.glob(os.path.expanduser('~') + "/AppData/Roaming/Adobe/After Effects/**/Scripts")
    for scripts_dir in scripts_dirs:
        ui_dir = scripts_dir + "/ScriptUI Panels"
        if os.path.exists(ui_dir) == False:
            os.mkdir(ui_dir)

        for lnk in glob.glob(ui_dir + "/*.lnk"):
            if os.path.basename(lnk).startswith("__cx__"):
                os.remove(lnk)

        shell = win32com.client.Dispatch("WScript.Shell")
        for jsx in panels:
            name = f"__cx__{os.path.basename(jsx)}.lnk"
            shortcut = shell.CreateShortCut(f"{ui_dir}/{name}")
            shortcut.TargetPath = jsx
            shortcut.WorkingDirectory = parent_dir
            shortcut.save()

        msg = f"{dir_name} Installation Success.\n\n" + "\n".join(scripts_dirs)

    return msg

if __name__ == "__main__":
    ret = main()
    print(ret)
