import {
    Focusable,
    PanelSection, Dropdown, ModalRoot
} from "decky-frontend-lib";
import { VFC, useEffect, useState, useRef } from "react";
import { ActionSet, FileData, FilesData } from "./Types/Types";
import { Panel, ScrollPanelGroup } from "./Components/Scrollable";
import { EditorProperties } from "./Types/EditorProperties";
import { executeAction } from "./Utils/executeAction";

export const BatEditor: VFC<EditorProperties> = ({
    serverAPI,
    initActionSet,
    initAction,
    contentId,
    closeModal
}) => {
    const [batData, setBatData] = useState([{ Id: 0, GameId: 0, Path: '', Content: '' }] as FileData[]);
    //const [editorText, setEditorText] = useState("test" as string);
    const [selectedBat, setSelectedBat] = useState({ Id: 0, GameId: 0, Content: "", Path: "" } as FileData);
    const focusRef = useRef(null);
    const [actionSetName, setActionSetName] = useState("" as string);
    const OnInit = async () => {
        const result = await executeAction(
            serverAPI, initActionSet,
            initAction,

            { content_id: contentId, }
        )
        const setName = (result.Content as ActionSet).SetName;
        setActionSetName(setName);
        const data = await executeAction(serverAPI, setName,
            "GetContent",
            {
                content_id: contentId,
            })
        const res = (data.Content as FilesData).Files;
        setBatData(res);
        if (res.length > 0)
            setSelectedBat(res[0] as FileData);

    }

    useEffect(() => {
        OnInit();
    }, []);
    return (
        <>
            <style>
                {`
        .GenericConfirmDialog {
            width: 100% !important,
            height: 100% !important,
        }
    `} </style>
            <ModalRoot
                bAllowFullSize={true}
                // @ts-ignore
                bAllowFullSizeMobile={true}
                closeModal={closeModal}
            >
                <ScrollPanelGroup focusable={false} style={{ margin: "0px" }}>
                    <Panel style={{ background: "inherit" }}>

                        <Focusable

                            onSecondaryActionDescription="Save bat files"
                            onSecondaryButton={async (_) => {
                                await executeAction(serverAPI, actionSetName,
                                    "SaveContent",
                                    {
                                        content_id: contentId,
                                        inputData: batData,
                                    });
                                //Router.Navigate("/game/" + tabindex + "/" + shortname)
                                closeModal();
                            }}
                            onCancel={(_) => {
                                closeModal();
                                //Router.Navigate("/game/" + tabindex + "/" + shortname)
                            }}
                            onCancelActionDescription="Go back to Game Details"
                        >
                            <PanelSection title={"Configuration: " + contentId}>
                                {batData.length > 0 && (
                                    <Focusable

                                        noFocusRing={false}
                                        style={{
                                            marginTop: "40px",
                                            height: "calc( 100% - 40px )",

                                            justifyContent: "center",
                                            margin: "40px",
                                        }}
                                    >
                                        <Focusable style={{ marginBottom: "1em" }}>
                                            <Dropdown rgOptions={batData.map((bat) => {
                                                return { data: bat.Id, label: bat.Path };
                                            })}
                                                selectedOption={batData[0].Id}
                                                onChange={(e: any) => {
                                                    const temp = batData.find((bat) => bat.Id == e.data);
                                                    setSelectedBat(temp as FileData);

                                                }} />
                                        </Focusable>
                                        <Focusable
                                            // @ts-ignore
                                            focusableIfNoChildren={true}
                                            noFocusRing={true}
                                            onFocusCapture={() => {
                                                if (focusRef && focusRef.current != null)
                                                    // @ts-ignore
                                                    focusRef.current.focus();
                                            }}>
                                            <textarea
                                                ref={focusRef}
                                                style={{ width: "calc( 100% - 10px )", height: "200px " }}
                                                value={selectedBat.Content}
                                                onChange={(e) => {
                                                    const newContent = e.target.value;
                                                    setSelectedBat(prevSelectedBat => ({ ...prevSelectedBat, Content: newContent }));

                                                    setBatData(prevBatData => {
                                                        const newData = [...prevBatData];
                                                        const batIndex = newData.findIndex(bat => bat.Id === selectedBat.Id);
                                                        if (batIndex !== -1) {
                                                            newData[batIndex] = { ...newData[batIndex], Content: newContent };
                                                        }
                                                        return newData;
                                                    });
                                                }} />
                                        </Focusable>
                                    </Focusable>
                                )}
                            </PanelSection>
                        </Focusable>

                    </Panel>
                </ScrollPanelGroup>
            </ModalRoot>
        </>
    );
};
