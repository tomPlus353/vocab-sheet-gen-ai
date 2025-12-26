import * as React from "react";

export default function PageContainer({ ...props }) {
    return <div>{props.children}</div>;
}
