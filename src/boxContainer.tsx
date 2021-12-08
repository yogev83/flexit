import React from "react";

const getTranslateX = (boxWidth, boxesInRow, index) => {
    const relativeIndex = index % boxesInRow;
    return relativeIndex * boxWidth;
};

const getTranslateY = (boxHeight, boxesInRow, index) => {
    const row = Math.floor(index / boxesInRow);
    return row * boxHeight;
};

let resize_ob;

export function BoxContainer({ children, filtered, className = "", ...rest }) {
    const boxContainerElement = React.useRef(null);
    const boxElement = React.useRef(null);
    const filteredOutBoxElement = React.useRef(null);

    const [sizes, setSizes] = React.useState({ box: null, boxContainer: null });
    const [previousFiltered, setPreviousFiltered] = React.useState([]);

    const boxWidth = React.useMemo(() => {
        return sizes.box?.width || 0;
    }, [sizes]);

    const boxHeight = React.useMemo(() => {
        return sizes.box?.height || 0;
    }, [sizes]);

    const boxesInRow = React.useMemo(() => {
        const containerWidth = sizes.boxContainer?.width || 0;
        return Math.floor(containerWidth / boxWidth);
    }, [sizes, boxWidth]);

    const childrenToRender = React.useMemo(() => {
        if (!boxWidth || !boxHeight || !boxesInRow) {
            return (
                <div ref={boxElement} className="flexit-box">
                    {children[0]}
                </div>
            );
        }

        const getFirstChangedChildIndex = () => {
            let found: number;
            previousFiltered.forEach((childIndex) => {
                if (!found && filtered.indexOf(childIndex) === -1) {
                    found = childIndex;
                }
            });

            if (!found) {
                filtered.forEach((childIndex) => {
                    if (!found && previousFiltered.indexOf(childIndex) === -1) {
                        found = childIndex;
                    }
                });
            }
            return found;
        };

        const firstChangedChildIndex = getFirstChangedChildIndex();

        const getTranslateValues = (position) => {
            const translateX = getTranslateX(boxWidth, boxesInRow, position);
            const translateY = getTranslateY(boxHeight, boxesInRow, position);
            return { x: translateX, y: translateY };
        };

        const getStyle = (childIndex, childIndexInFiltered) => {
            const filteredOut = childIndexInFiltered === -1;
            const childPosition = filteredOut ? childIndex : childIndexInFiltered;
            const translateValues = getTranslateValues(childPosition);

            return {
                transform: `translate(${translateValues.x}px, ${translateValues.y}px)`,
                opacity: filteredOut ? 0 : 1,
            };
        };

        return children.map((child: any, i: any) => {
            const style = getStyle(i, filtered.indexOf(i));

            if (firstChangedChildIndex === i) {
                return (
                    <div key={i} ref={boxElement} className="flexit-box" style={style}>
                        {child}
                    </div>
                );
            }
            return (
                <div key={i} className="flexit-box" style={style}>
                    {child}
                </div>
            );
        });
    }, [filtered, children, boxWidth, boxHeight, boxesInRow, filteredOutBoxElement]);

    const classNameString = React.useMemo(() => {
        return `flexit-boxContainer${className ? " " + className : ""}`;
    }, [className]);

    React.useEffect(() => {
        if (sizes.box) {
            return;
        }

        setSizes((s) => {
            return {
                ...s,
                box: boxElement.current?.getBoundingClientRect(),
            };
        });
    }, [boxElement, sizes]);

    React.useEffect(() => {
        if (!boxElement.current) {
            return;
        }

        const addListeners = (element) => {
            // const onOpacityStarted = (e) => {
            //     if (e.propertyName === "opacity") {
            //         element.removeEventListener("transitionstart", onOpacityStarted);
            //         setState("fading");
            //     }
            // };
            // const onOpacitynEnd = (e) => {
            //     if (e.propertyName === "opacity") {
            //         element.removeEventListener("transitionend", onOpacitynEnd);
            //         setFading(fading);
            //     }
            // };
            // const onTransformStarted = (e) => {
            //     if (e.propertyName === "transform") {
            //         element.removeEventListener("transitionstart", onTransformStarted);
            //         setFading(true);
            //     }
            // };
            // const onTransformEnd = (e) => {
            //     if (e.propertyName === "transform") {
            //         element.removeEventListener("transitionend", onTransformEnd);
            //         setFading(false);
            //     }
            // };
            // element.addEventListener("transitionstart", onOpacityStarted);
            // element.addEventListener("transitionend", onOpacitynEnd);
            // element.addEventListener("transitionstart", onTransformStarted);
            // element.addEventListener("transitionend", onTransformEnd);
        };

        addListeners(boxElement.current);
    }, [boxElement.current]);

    React.useEffect(() => {
        if (boxContainerElement.current) {
            if (resize_ob) {
                resize_ob.unobserve(boxContainerElement.current);
            }
            resize_ob = new ResizeObserver((entries) => {
                setSizes((s) => {
                    return {
                        ...s,
                        boxContainer: entries[0].contentRect,
                    };
                });
            });

            resize_ob.observe(boxContainerElement.current);
        }
    }, [boxContainerElement]);

    React.useEffect(() => {
        // const unchanged = () => {
        //     let same = true;
        //     filtered.forEach((index, i) => {
        //         if (same && index !== previousFiltered[i]) {
        //             same = false;
        //         }
        //     });

        //     return same && filtered.length === previousFiltered.length;
        // };

        // if (unchanged()) {
        //     console.log("unchaged!!!");
        //     return;
        // }

        setPreviousFiltered(filtered);
    }, [filtered]);

    return (
        <div ref={boxContainerElement} className={classNameString} {...rest}>
            {childrenToRender}
        </div>
    );
}
