/* -*- Mode: C++; tab-width: 20; indent-tabs-mode: nil; c-basic-offset: 2 -*-
//  * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef MOZILLA_GFX_GRALLOCTEXTUREHOST_H
#define MOZILLA_GFX_GRALLOCTEXTUREHOST_H
#ifdef MOZ_WIDGET_GONK

#include "mozilla/layers/CompositorOGL.h"
#include "mozilla/layers/TextureHostOGL.h"
#include "mozilla/layers/ShadowLayerUtilsGralloc.h"
#include <ui/GraphicBuffer.h>

namespace mozilla {
namespace layers {

class GrallocTextureHostOGL : public TextureHost
{
  friend class GrallocBufferActor;
public:
  GrallocTextureHostOGL(TextureFlags aFlags,
                        const SurfaceDescriptorGralloc& aDescriptor);

  virtual ~GrallocTextureHostOGL();

  virtual bool Lock() override;

  virtual void Unlock() override;

  virtual void SetTextureSourceProvider(
      TextureSourceProvider* aProvider) override;

  virtual void DeallocateSharedData() override;

  virtual void ForgetSharedData() override;

  virtual void DeallocateDeviceData() override;

  virtual gfx::SurfaceFormat GetFormat() const override;

  virtual void CreateRenderTexture(
      const wr::ExternalImageId& aExternalImageId) override;

  virtual bool AcquireTextureSource(CompositableTextureSourceRef& aTexture) override;

  virtual void PushResourceUpdates(
      wr::TransactionBuilder& aResources,
      ResourceUpdateOp aOp,
      const Range<wr::ImageKey>& aImageKeys,
      const wr::ExternalImageId& aExtID) override;

  virtual void PushDisplayItems(
      wr::DisplayListBuilder& aBuilder,
      const wr::LayoutRect& aBounds,
      const wr::LayoutRect& aClip, wr::ImageRendering aFilter,
      const Range<wr::ImageKey>& aImageKeys,
      PushDisplayItemFlagSet aFlags) override;

  virtual gfx::IntSize GetSize() const override { return mCropSize; }

  virtual LayerRenderState GetRenderState() override;

  virtual void PrepareTextureSource(CompositableTextureSourceRef& aTextureSource) override;

  virtual bool BindTextureSource(CompositableTextureSourceRef& aTextureSource) override;

  virtual void UnbindTextureSource() override;

  virtual already_AddRefed<gfx::DataSourceSurface> GetAsSurface() override;

  virtual void WaitAcquireFenceHandleSyncComplete() override;

  virtual void SetCropRect(nsIntRect aCropRect) override;

  bool IsValid() const;

  virtual const char* Name() override { return "GrallocTextureHostOGL"; }

  gl::GLContext* GetGLContext() const { return mCompositor ? mCompositor->gl() : nullptr; }

  bool NeedsFenceHandle()
  {
#if defined(MOZ_WIDGET_GONK)
    return true;
#else
    return false;
#endif
  }

  virtual GrallocTextureHostOGL* AsGrallocTextureHostOGL() override { return this; }

private:
  void CreateEGLImage();
  void DestroyEGLImage();

  SurfaceDescriptorGralloc mGrallocHandle;
  RefPtr<GLTextureSource> mGLTextureSource;
  RefPtr<CompositorOGL> mCompositor;
  // Size reported by the GraphicBuffer
  gfx::IntSize mSize;
  // Size reported by TextureClient, can be different in some cases (video?),
  // used by LayerRenderState.
  gfx::IntSize mCropSize;
  gfx::SurfaceFormat mFormat;
  EGLImage mEGLImage;
  bool mIsOpaque;
  wr::MaybeExternalImageId mExternalImageId;
};

} // namespace layers
} // namespace mozilla

#endif
#endif
