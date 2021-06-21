import React, { forwardRef, memo } from 'react';
import { StyleSheet } from 'react-native';
import Backdrop from '../Backdrop';
import { Slide } from '../Transitions';
import { FocusScope } from '@react-native-aria/focus';
import {
  useControllableState,
  usePropsResolution,
  useKeyboardDismissable,
} from '../../../hooks';
import { ModalContext } from './Context';
import Box from '../../primitives/Box';
import type { IModalProps } from './types';
import { Fade } from '../../composites/Transitions';
import { useKeyboardBottomInset } from '../../../utils';
import { Overlay } from '../../primitives';
import { AnimatedPresence } from '../Transitions/AnimatedPresence';

const Modal = (
  {
    children,
    isOpen,
    onClose,
    defaultIsOpen,
    initialFocusRef,
    finalFocusRef,
    avoidKeyboard,
    closeOnOverlayClick = true,
    isKeyboardDismissable = true,
    overlayVisible = true,
    //@ts-ignore - internal purpose only
    animationPreset = 'fade',
    ...rest
  }: IModalProps,
  ref: any
) => {
  const bottomInset = useKeyboardBottomInset();
  const { contentSize, ...restThemeProps } = usePropsResolution('Modal', rest);

  const [visible, setVisible] = useControllableState({
    value: isOpen,
    defaultValue: defaultIsOpen,
    onChange: (val) => {
      if (!val) onClose && onClose();
    },
  });

  useKeyboardDismissable({
    enabled: isKeyboardDismissable && visible,
    callback: () => setVisible(false),
  });

  let child = (
    <Box
      bottom={avoidKeyboard ? bottomInset + 'px' : undefined}
      {...restThemeProps}
      ref={ref}
      pointerEvents="box-none"
    >
      {children}
    </Box>
  );

  const handleClose = () => setVisible(false);

  return (
    <AnimatedPresence>
      {isOpen && (
        <Overlay onRequestClose={handleClose}>
          <ModalContext.Provider
            value={{
              handleClose,
              contentSize,
              initialFocusRef,
              finalFocusRef,
            }}
          >
            <Fade
              exitDuration={150}
              entryDuration={200}
              style={StyleSheet.absoluteFill}
            >
              {overlayVisible && (
                <Backdrop
                  onPress={() => {
                    closeOnOverlayClick && setVisible(false);
                  }}
                />
              )}
            </Fade>
            {animationPreset === 'slide' ? (
              <Slide duration={150}>
                <FocusScope
                  contain={visible}
                  autoFocus={visible && !initialFocusRef}
                  restoreFocus={visible && !finalFocusRef}
                >
                  {child}
                </FocusScope>
              </Slide>
            ) : (
              <Fade
                exitDuration={150}
                entryDuration={200}
                style={StyleSheet.absoluteFill}
              >
                <FocusScope
                  contain={visible}
                  autoFocus={visible && !initialFocusRef}
                  restoreFocus={visible && !finalFocusRef}
                >
                  {child}
                </FocusScope>
              </Fade>
            )}
          </ModalContext.Provider>
        </Overlay>
      )}
    </AnimatedPresence>
  );
};

export default memo(forwardRef(Modal));
