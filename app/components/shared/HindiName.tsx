"use client";
import React, { useState } from "react";

import { IndicTransliterate } from "@ai4bharat/indic-transliterate";

const HindiName = ({ name }: { name: string }) => {
    const [text, setText] = useState(name);

    return (
        <>
            <span>{text}</span>
            <IndicTransliterate
                value={text}
                onChangeText={(text) => {
                    setText(text);
                }}
                lang="hi"
            />

        </>
    );
};

export default HindiName;