/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set ts=8 sts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 *  * License, v. 2.0. If a copy of the MPL was not distributed with this
 *   * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "TextureHostBasic.h"
#ifdef XP_MACOSX
#  include "MacIOSurfaceTextureHostBasic.h"
#endif
#ifdef MOZ_WIDGET_GONK
#  include "GrallocTextureHostBasic.h"
#endif

using namespace mozilla::gl;
using namespace mozilla::gfx;

namespace mozilla {
namespace layers {

already_AddRefed<TextureHost> CreateTextureHostBasic(
    const SurfaceDescriptor& aDesc, ISurfaceAllocator* aDeallocator,
    LayersBackend aBackend, TextureFlags aFlags) {
#ifdef XP_MACOSX
  if (aDesc.type() == SurfaceDescriptor::TSurfaceDescriptorMacIOSurface) {
    const SurfaceDescriptorMacIOSurface& desc =
        aDesc.get_SurfaceDescriptorMacIOSurface();
    return MakeAndAddRef<MacIOSurfaceTextureHostBasic>(aFlags, desc);
  }
#endif
#ifdef MOZ_WIDGET_GONK
  if (aDesc.type() == SurfaceDescriptor::TSurfaceDescriptorGralloc) {
    const SurfaceDescriptorGralloc& desc = aDesc.get_SurfaceDescriptorGralloc();
    return MakeAndAddRef<GrallocTextureHostBasic>(aFlags, desc);
  }
#endif
  return CreateBackendIndependentTextureHost(aDesc, aDeallocator, aBackend,
                                             aFlags);
}

}  // namespace layers
}  // namespace mozilla
