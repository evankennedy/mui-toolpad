import * as React from 'react';
import clsx from 'clsx';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopy from '@mui/icons-material/ContentCopy';
import { IconButton, styled, Tooltip } from '@mui/material';
import * as appDom from '../../../../appDom';
import {
  absolutePositionCss,
  Rectangle,
  RectangleEdge,
  RECTANGLE_EDGE_BOTTOM,
  RECTANGLE_EDGE_LEFT,
  RECTANGLE_EDGE_RIGHT,
} from '../../../../utils/geometry';
import { useDom } from '../../../AppState';
import { useToolpadComponent } from '../../toolpadComponents';
import { getElementNodeComponentId } from '../../../../toolpadComponents';

const HINT_POSITION_TOP = 'top';
const HINT_POSITION_BOTTOM = 'bottom';

const HUD_HEIGHT = 30; // px

type HintPosition = typeof HINT_POSITION_TOP | typeof HINT_POSITION_BOTTOM;

function stopPropagationHandler(event: React.SyntheticEvent) {
  event.stopPropagation();
}

const nodeHudClasses = {
  allowNodeInteraction: 'NodeHud_AllowNodeInteraction',
  selected: 'NodeHud_Selected',
  selectionHint: 'NodeHud_SelectionHint',
};

const NodeHudWrapper = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isOutlineVisible' && prop !== 'isHoverable',
})<{
  isOutlineVisible: boolean;
  isHoverable: boolean;
}>(({ isOutlineVisible, isHoverable, theme }) => ({
  // capture mouse events
  pointerEvents: 'initial',
  position: 'absolute',
  userSelect: 'none',
  outline: `1px dotted ${isOutlineVisible ? theme.palette.primary[500] : 'transparent'}`,
  zIndex: 2,
  '&:hover': {
    outline: `2px dashed ${isHoverable ? 'transparent' : theme.palette.primary[500]}`,
  },
  [`.${nodeHudClasses.selected}`]: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    outline: `2px solid ${theme.palette.primary[500]}`,
    left: 0,
    top: 0,
    zIndex: 2,
  },
  [`&.${nodeHudClasses.allowNodeInteraction}`]: {
    // block pointer-events so we can interact with the selection
    pointerEvents: 'none',
  },
}));

const SelectionHintWrapper = styled('div', {
  shouldForwardProp: (prop) => prop !== 'hintPosition',
})<{
  hintPosition: HintPosition;
}>(({ hintPosition, theme }) => ({
  position: 'absolute',
  [`.${nodeHudClasses.selectionHint}`]: {
    // capture mouse events
    pointerEvents: 'initial',
    cursor: 'grab',
    display: 'flex',
    position: 'absolute',
    alignItems: 'center',
    right: -1,
    background: theme.palette.primary[500],
    color: 'white',
    fontSize: 11,
    padding: `0 0 0 8px`,
    height: HUD_HEIGHT,
    zIndex: 1000,
    ...(hintPosition === HINT_POSITION_TOP
      ? { top: 0, transform: 'translate(0, -100%)' }
      : { bottom: 0, transform: 'translate(0, 100%)' }),
  },
}));

const DraggableEdgeWrapper = styled('div')({
  userSelect: 'none',
  position: 'absolute',
  zIndex: 3,
});

const DraggableEdge = styled('div', {
  shouldForwardProp: (prop) => prop !== 'edge',
})<{
  edge: RectangleEdge;
}>(({ edge }) => {
  let dynamicStyles = {};
  if (edge === RECTANGLE_EDGE_RIGHT) {
    dynamicStyles = {
      cursor: 'ew-resize',
      top: 0,
      right: -10,
      height: '100%',
      width: 22,
    };
  }
  if (edge === RECTANGLE_EDGE_LEFT) {
    dynamicStyles = {
      cursor: 'ew-resize',
      top: 0,
      left: -10,
      height: '100%',
      width: 22,
    };
  }
  if (edge === RECTANGLE_EDGE_BOTTOM) {
    dynamicStyles = {
      cursor: 'ns-resize',
      bottom: -10,
      height: 22,
      left: 0,
      width: '100%',
    };
  }

  return {
    ...dynamicStyles,
    position: 'absolute',
    pointerEvents: 'initial',
    zIndex: 3,
  };
});

const ResizePreview = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.primary[500],
  opacity: 0.2,
  zIndex: 3,
}));

interface NodeHudProps {
  node: appDom.AppDomNode;
  rect: Rectangle;
  isSelected?: boolean;
  isInteractive?: boolean;
  onNodeDragStart?: React.DragEventHandler<HTMLElement>;
  draggableEdges?: RectangleEdge[];
  onEdgeDragStart?: (edge: RectangleEdge) => React.MouseEventHandler<HTMLElement>;
  onDelete?: React.MouseEventHandler<HTMLElement>;
  isResizing?: boolean;
  resizePreviewElementRef: React.MutableRefObject<HTMLDivElement | null>;
  onDuplicate?: (event: React.MouseEvent) => void;
  isOutlineVisible?: boolean;
  isHoverable?: boolean;
}

export default function NodeHud({
  node,
  rect,
  isSelected,
  isInteractive,
  onNodeDragStart,
  draggableEdges = [],
  onEdgeDragStart,
  onDelete,
  isResizing = false,
  resizePreviewElementRef,
  onDuplicate,
  isOutlineVisible = false,
  isHoverable = true,
}: NodeHudProps) {
  const { dom } = useDom();

  const componentId = appDom.isElement(node) ? getElementNodeComponentId(node) : '';
  const component = useToolpadComponent(dom, componentId);

  const hintPosition = rect.y > HUD_HEIGHT ? HINT_POSITION_TOP : HINT_POSITION_BOTTOM;

  return (
    <React.Fragment>
      <NodeHudWrapper
        data-node-id={node.id}
        style={absolutePositionCss(rect)}
        className={clsx({
          [nodeHudClasses.allowNodeInteraction]: isInteractive,
        })}
        isOutlineVisible={isOutlineVisible}
        isHoverable={isHoverable}
      >
        {isSelected ? <span className={nodeHudClasses.selected} /> : null}
        {isResizing ? (
          <ResizePreview ref={resizePreviewElementRef} style={absolutePositionCss(rect)} />
        ) : null}
      </NodeHudWrapper>
      {isSelected ? (
        <SelectionHintWrapper style={absolutePositionCss(rect)} hintPosition={hintPosition}>
          <div
            draggable
            className={nodeHudClasses.selectionHint}
            onDragStart={onNodeDragStart}
            role="presentation"
            onClick={stopPropagationHandler}
            onMouseDown={stopPropagationHandler}
            onMouseUp={stopPropagationHandler}
          >
            {component?.displayName || '<unknown>'}
            <DragIndicatorIcon color="inherit" />
            <IconButton aria-label="Duplicate" color="inherit" onMouseUp={onDuplicate}>
              <Tooltip title="Duplicate" enterDelay={400}>
                <ContentCopy color="inherit" />
              </Tooltip>
            </IconButton>
            <IconButton aria-label="Remove" color="inherit" onMouseUp={onDelete}>
              <Tooltip title="Remove" enterDelay={400}>
                <DeleteIcon color="inherit" />
              </Tooltip>
            </IconButton>
          </div>
        </SelectionHintWrapper>
      ) : null}
      {onEdgeDragStart ? (
        <DraggableEdgeWrapper style={absolutePositionCss(rect)}>
          {draggableEdges.map((edge) => (
            <DraggableEdge
              key={`${node.id}-edge-${edge}`}
              edge={edge}
              onMouseDown={onEdgeDragStart(edge)}
            />
          ))}
        </DraggableEdgeWrapper>
      ) : null}
    </React.Fragment>
  );
}
