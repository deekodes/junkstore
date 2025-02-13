import {
    Focusable,
    PanelSection, Dropdown, ModalRoot, ModalRootProps
} from "decky-frontend-lib";
import { VFC, useEffect, useState, useRef } from "react";
import { ValueType, Section, ConfData, KeyValuePair, ActionSet, ContentError } from "./Types/Types";
import { SectionEditor } from "./Components/SectionEditor";
import { Panel, ScrollPanelGroup } from "./Components/Scrollable";
import Logger from "./Utils/logger";
import { EditorProperties } from "./Types/EditorProperties";
import { executeAction } from "./Utils/executeAction";

export interface ErrorModalProps extends ModalRootProps {
    Error: ContentError;

}

export const ConfEditor: VFC<EditorProperties> = ({
    serverAPI, initActionSet, initAction, contentId, closeModal
}) => {
    const logger = new Logger("ConfEditor")
    logger.log(`initActionSet: ${initActionSet}, initAction: ${initAction}, contentId: ${contentId}`)
    const [confData, setConfData] = useState({} as ConfData);
    const focusRef = useRef(null);
    const [modeLevel, setModeLevel] = useState(0 as number);
    const [actionSetName, setActionSetName] = useState("" as string);
    const [helpText, setHelpText] = useState({
        Key: "",
        Description: "",
        DefaultValue: "",
        Value: "",
        Type: ValueType.String,
        Min: 0,
        ModeLevel: 0,
        Max: 100,
        Parents: [],
        EnumValues: [],
    } as KeyValuePair);
    const [sectionHelpText, setSectionHelpText] = useState("" as string);
    useEffect(() => {
        OnInit();

    }, []);
    const OnInit = async () => {
        const result = await executeAction(
            serverAPI,
            initActionSet,
            initAction,
            {
                content_id: contentId
            }
        )
        logger.log("OnInit result: ", result)

        const setName = (result.Content as ActionSet).SetName;
        logger.log("SetName: ", setName)
        setActionSetName(setName);
        const data = await executeAction(
            serverAPI,
            setName,
            "GetContent",
            {
                content_id: contentId
            }
        )

        const res = data.Content as ConfData
        setConfData(res);

    }
    const handleSectionChange = (section: Section) => {
        const updatedSections = confData.Sections.map((s) => s.Name === section.Name ? section : s
        );
        setConfData({ ...confData, Sections: updatedSections });
    };
    const updateHelpText = (field: KeyValuePair) => {
        setHelpText(field);
    };
    return (
        <>
            <style>
                {`
            .GenericConfirmDialog {
                width: 100% !important;
            }
        `} </style>
            <ModalRoot>


                <ScrollPanelGroup focusable={false}>
                    <Panel style={{ background: "inherit" }}>
                        <Focusable style={{ display: "flex", marginTop: "0px" }}>
                            <Focusable
                                style={{
                                    flex: "1",
                                }}
                                onSecondaryActionDescription="Save config"
                                onSecondaryButton={async (_) => {
                                    logger.log("Saving config: ", confData)
                                    const result = await executeAction(serverAPI,
                                        actionSetName,
                                        "SaveContent",
                                        {
                                            content_id: contentId,
                                            inputData: confData
                                        });
                                    logger.log("Save result: ", result)
                                    //Router.Navigate("/game/" + tabindex + "/" + shortname)
                                    closeModal();
                                }}
                                onCancel={(_) => {
                                    closeModal();
                                    //Router.Navigate("/game/" + tabindex + "/" + shortname)
                                }}
                                onCancelActionDescription="Go back to Game Details"
                            >
                                <PanelSection title={"Configuration: "}>
                                    <Dropdown
                                        rgOptions={[
                                            { data: 0, label: "Basic" },
                                            { data: 1, label: "Advanced" },
                                            { data: 2, label: "Expert" },
                                            { data: 3, label: "All" },
                                        ]}
                                        onChange={(e) => {
                                            setModeLevel(e.data);
                                        }}
                                        selectedOption={modeLevel} />
                                    {confData.Sections?.map((section) => {
                                        if (section && modeLevel >= section.ModeLevel)
                                            return (
                                                <SectionEditor
                                                    key={section.Name}
                                                    section={section}
                                                    modeLevel={modeLevel}
                                                    onChange={(updatedSection) => handleSectionChange(updatedSection)}
                                                    updateHelpText={(field: KeyValuePair) => {
                                                        updateHelpText(field);
                                                        setSectionHelpText(section.Description);

                                                    }} />
                                            );
                                        else
                                            return null;
                                    })}
                                </PanelSection>
                                {confData.AutoexecEnabled && confData.Autoexec && (
                                    <PanelSection title="[Autoexec]">
                                        <Focusable
                                            // @ts-ignore
                                            focusableIfNoChildren={true}
                                            noFocusRing={true}
                                            onFocusCapture={() => {
                                                if (focusRef && focusRef.current != null)
                                                    // @ts-ignore
                                                    focusRef.current.focus();
                                            }}
                                            onOKButton={() => { }}
                                        >
                                            
                                            <textarea
                                                className=""
                                                ref={focusRef}
                                                style={{ width: "100%", height: "200px" }}
                                                value={confData.Autoexec}
                                                onChange={(e) => {
                                                    setConfData({ ...confData, Autoexec: e.target.value });
                                                }} />
                                        </Focusable>
                                    </PanelSection>
                                )}
                            </Focusable>
                            <Focusable
                                focusWithinClassName="gpfocuswithin"
                                onActivate={() => {
                                    // WIP
                                    // showModal(
                                    //   <DetailsModal
                                    //     sectionHelpText={sectionHelpText}
                                    //     helpText={helpText}
                                    //   />
                                    // );
                                }}
                                style={{
                                    flex: 1,
                                    minHeight: 0,
                                    marginRight: "20px",
                                    position: "sticky",
                                    height: "fit-content",
                                    top: "40px",
                                }}
                            >
                                <Panel focusable={true} noFocusRing={false}>
                                    <div>{sectionHelpText}</div>
                                    <div>{helpText.Description}</div>
                                    {helpText.EnumValues &&
                                        helpText.EnumValues.map((enumValue) => (
                                            <div>
                                                {enumValue.Key} {enumValue.Description}
                                            </div>
                                        ))}
                                </Panel>
                            </Focusable>
                        </Focusable>
                    </Panel>
                </ScrollPanelGroup>
            </ModalRoot>
        </>
    );
};
