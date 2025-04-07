/**
 * 测试 userBehaviour 模块
 */
import { describe, it, expect, vi } from 'vitest'
import UserBehaviour from '../src/core/userBehaviour'

describe('UserBehaviour 模块', () => {
  it('应该能正确初始化', () => {
    const userBehaviour = new UserBehaviour({
      mouseMovementInterval: 1,
      processTime: 1000,
    })
    expect(userBehaviour).toBeDefined()
  })

  it('应该能正确处理用户行为', () => {
    const userBehaviour = new UserBehaviour({
      mouseMovementInterval: 1,
      processTime: 1000,
    })
    expect(userBehaviour).toBeDefined()
  })
})
